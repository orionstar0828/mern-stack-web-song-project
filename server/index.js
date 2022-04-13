const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const SocketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
var fs = require('fs');
var path = require('path');
var ffprobe = require('ffprobe'), ffprobeStatic = require('ffprobe-static');

const { readdirSync } = require('fs');

let app = express();
app.use(cors());


const httpServer = http.createServer(app);
const io = SocketIO(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

httpServer.listen(5000, function () {
  console.log('backend is listening on port 5000!');
});

const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

async function run() {
}
run().catch(console.dir);

function findDistinct(collection, field) {
  return new Promise((resolve, reject) => {
    collection.distinct("date", {}, 
      (function(err, result) {
        (err)? reject(err): resolve(result.sort().reverse());
      })
    );
  });
}

function insertOne(collection, data) {
  return new Promise((resolve, reject) => {
    collection.insertOne(data, 
      (function(err, result) {
        (err)? reject(err): resolve(result.insertedId);
      })
    );
  });
}

function findFileInFolder(folder_name) {
  return new Promise((resolve, reject) => {
    var fileType = '.mp4';
    var files = [];
    fs.readdir(folder_name, function(err, list){
        if(err) reject(err);
        for(var i = 0; i < list.length; i++)
            if(path.extname(list[i]) === fileType)
                files.push(list[i]);
        resolve(files)
    });
  });
}

function getFileDuration(file) {
  return new Promise((resolve, reject) => {
    ffprobe(file, { path: ffprobeStatic.path }, function (err, info) {
      if(err) {
        resolve('err');
      } else {
        var length = Number(info.streams[0].duration).toFixed(0);
        let hour = Math.floor(length / 3600) < 10 ? "0" + Math.floor(length / 3600) : Math.floor(length / 3600).toString();
        let min = Math.floor((length - hour * 3600) / 60) < 10 ? "0" + Math.floor((length - hour * 3600) / 60) : Math.floor((length - hour * 3600) / 60).toString();
        let sec = (length - hour * 3600 - min * 60) < 10 ? "0" + (length - hour * 3600 - min * 60) : (length - hour * 3600 - min * 60).toString();
        resolve(hour + ":" + min + ":" + sec);
      }
    });
  });
}

function findByQuery(collection, data = {}, sort = {}) {
  return new Promise((resolve, reject) => {
    collection.find(data).collation({ locale: "en" }).sort(sort).toArray(function(err, result) {
      (err)? reject(err): resolve(result);
    });
  });
}

function findBySongs(collection, query, sort, skip, page_size) {
  return new Promise((resolve, reject) => {
    collection.find(query).collation({ locale: "en" }).sort(sort).skip(skip).limit(page_size).toArray(function(err, result) {
      (err)? reject(err): resolve(result);
    });
  });
}

function deleteOne(collection, data = {}) {
  return new Promise((resolve, reject) => {
    collection.deleteOne(data, function(err, result) {
      (err)? reject(err): resolve("");
    });
  });
}

function deleteMany(collection, data = {}) {
  return new Promise((resolve, reject) => {
    collection.deleteMany(data, function(err, result) {
      (err)? reject(err): resolve("");
    });
  });
}

function getCount(collection, query = {}) {
  return new Promise((resolve, reject) => {
    collection.count(query, function(err, result) {
      (err)? reject(err): resolve(result);
    });
  });
}

var sendCurrentQueueToSender = function (socket) {
  let current_queue = fs.readFileSync('./current_queue.json', "utf8");
  try {
    current_queue = JSON.parse(current_queue);
    socket.emit('currentQueue', current_queue);
  } catch {
    socket.emit('currentQueue', []);
  }
};

var sendCurrentQueueToAllExceptSender = function (socket) {
  let current_queue = fs.readFileSync('./current_queue.json', "utf8");
  try {
    current_queue = JSON.parse(current_queue);
    socket.broadcast.emit('changeQueue', current_queue);
  } catch {
    socket.broadcast.emit('changeQueue', []);
  }
};

// var sendCurrentQueueToSender = function (socket) {
//   fs.readFile('current_queue.json', 'utf8', function(err, current_queue) {
//       current_queue = JSON.parse(current_queue);
//       socket.emit('currentQueue', current_queue);
//   });
// };

// var sendCurrentQueueToAllExceptSender = function (socket) {
//   fs.readFile('current_queue.json', 'utf8', function(err, current_queue) {
//       current_queue = JSON.parse(current_queue);
//       socket.broadcast.emit('changeQueue', current_queue);
//   });
// };

io.on('connection', function (socket) {
  socket.on('fetchCurrentQueue', function () {
    sendCurrentQueueToSender(socket);
  });

  socket.on('changeQueue', function (queue) {
    fs.writeFileSync('./current_queue.json', JSON.stringify(queue, null, '\t'));
    sendCurrentQueueToAllExceptSender(socket);
  });
});

app.get('/', async function(req, res) {
	try {
		let data = {
		  "folders": [],
		  "public_playlists": [],
		  "queue_history": [],
		  "singers": [],
		  "singer_playlists": [],
		}
		await client.connect();
		const database = client.db('db_karaoke');
		const c_folders = database.collection('c_folders');
		const c_public_playlists = database.collection('c_public_playlists');
		const c_queue_history = database.collection('c_queue_history');
		const c_singers = database.collection('c_singers');
		const c_singer_playlists = database.collection('c_singer_playlists');
		data.folders = await findByQuery(c_folders, "", "name");
		data.public_playlists = await findByQuery(c_public_playlists);
		data.singers = await findByQuery(c_singers);
		if(data.singers[0]) {
		  singer_id = data.singers[0]._id;
		  query = {singer_id: singer_id};
		  data.singer_playlists = await findByQuery(c_singer_playlists, query);
		}
		data.queue_history = await findDistinct(c_queue_history, "date");
		res.send({data: data});
	} catch {
		await client.close();
	}
});

app.get('/get_all_public_playlists', async function(req, res) {
  try {
    let data = {
      "public_playlists": [],
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_public_playlists = database.collection('c_public_playlists');
    data.public_playlists = await findByQuery(c_public_playlists);
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/save_note', async function(req, res) {
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_files = database.collection('c_files');
    await c_files.updateOne({path: req.query.path}, {$set: {note: req.query.note}});
    res.send({data: "data"});
  } catch {
    await client.close();
  }
});

app.get('/update_public_playlists_note', async function(req, res) {
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_public_playlists = database.collection('c_public_playlists');
		let playlists = await findByQuery(c_public_playlists);
    for(const playlist of playlists) {
      await c_public_playlists.updateOne(
        {"_id": new ObjectId(playlist._id), "songs.path": req.query.path},
        {
           $set: { "songs.$.note": req.query.note }
        }
      )
    }
    res.send({data: "data"});
  } catch {
    await client.close();
  }
});

app.get('/update_singer_playlists_note', async function(req, res) {
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singer_playlists = database.collection('c_singer_playlists');
		let playlists = await findByQuery(c_singer_playlists);
    for(const playlist of playlists) {
      await c_singer_playlists.updateOne(
        {"_id": new ObjectId(playlist._id), "songs.path": req.query.path},
        {
           $set: { "songs.$.note": req.query.note }
        }
      )
    }
    res.send({data: "data"});
  } catch {
    await client.close();
  }
});

app.get('/update_queue_history_note', async function(req, res) {
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_queue_history = database.collection('c_queue_history');
    await c_queue_history.updateMany({path: req.query.path}, {$set: {note: req.query.note}});
    res.send({data: "data"});
  } catch {
    await client.close();
  }
});

app.get('/get_all_singer_playlists', async function(req, res) {
  try {
    let data = {
      "singer_playlists": [],
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singer_playlists = database.collection('c_singer_playlists');
    data.singer_playlists = await findByQuery(c_singer_playlists);
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/get_all_queue_history', async function(req, res) {
  try {
    let data = {
      "queue_history": []
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_queue_history = database.collection('c_queue_history');
    data.queue_history = await findDistinct(c_queue_history, "date");
    res.send({data: data});
  } catch {
    await client.close();
  }
});

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

app.get('/get_folders', async function(req, res) {
  try {
    let data = {
      "folders": [],
    }
    data.folders = getDirectories(req.query.path);
    res.send({data: data});
  } catch {
  }
});

var all_songs = [];
var count = 0;

var get_all_files = async function (path, id) {
    let files = await findFileInFolder(path);
    for(let i = 0; i < files.length; i++) {
      let file = files[i];
      let song = {
        "folder_id": id,
        "artist": "",
        "name": "",
        "length": "",
        "path": path + "/" + file,
        "play_count": 0,
        "note": ""
      };
      let pair = file.split(" - ");
      if(pair[1] == undefined) {
        console.log('skip - path:', path + "/" + file)
        continue;
      }
      song.artist = pair[0].trim();
      song.name = pair[1].replace('.mp4', '').trim();
      let length = await getFileDuration(path + "/" + file);
      if(length == 'err') { 
        console.log('skip - path:', path + "/" + file)
        continue;
      } else {
        song.length = length
      }
      count++;
      console.log(count);
      all_songs.push(song);
    };
    let folders = getDirectories(path);
    for(let i = 0; i < folders.length; i++) {
      await get_all_files(path + '/' + folders[i], id);
    }
};

app.get('/reload_folder/:id/:name', async function(req, res) {
  try {
    all_songs = [];
	  count = 0;
    let cnt = 0;
    await client.connect();
    const database = client.db('db_karaoke');
    const c_files = database.collection('c_files');
    let query = { folder_id: new ObjectId(req.params.id) }
    const files = await findByQuery(c_files, query);
    let path = req.query.path;
    path = path.replace(/\\/g, '/');
    if(path.charAt(path.length - 1) !== '/') {
      path += '/';
    }
    path += req.params.name;
    await get_all_files(path, req.params.id);
    let temp_files = new Array(files.length);
    let changed = false;
	  console.log('checking...')
    for (const song of all_songs) {
        if(files.some(item => item.path == song.path)) {
          for (let i = files.length - 1; i >= 0; i--) {
            if(files[i].path === song.path)
              temp_files[i]= 1;
          }
        } else {
          query = {folder_id: new ObjectId(song.folder_id), artist: song.artist, name: song.name, length: song.length, path: song.path, play_count: 0, note: ""};
          await insertOne(c_files, query);
		  cnt++;
          changed = true;
        }
    }
    if(cnt > 0) {
      console.log('inserted ' + cnt + ' songs');
      cnt = 0;
    }
    for (let i = temp_files.length - 1; i >= 0; i--) {
      if(!temp_files[i]) {
        query = {_id: new ObjectId(files[i]._id)}
        await deleteOne(c_files, query);
		cnt++;
        changed = true;
      }
    }
    if(cnt > 0) {
      console.log('deleted ' + cnt + ' songs');
      cnt = 0;
    }
    if(changed === true) {
	    console.log('changed. sent to client')
      res.send({data: 'changed'});
	  } else {
	    console.log('no changed')
      res.send({data: 'ok'});
  	}
  } catch {
    await client.close();
  }
});

app.get('/get_folders_in_db', async function(req, res) {
  try {
    let data = {
      "folders": [],
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_folders = database.collection('c_folders');
    data.folders = await findByQuery(c_folders, "", "name");
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/save_singer', async function(req, res) {
  try {
    data = {
      "singer": {}
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singers = database.collection('c_singers');
    const firstname = req.query.firstname;
    const lastname = req.query.lastname;
    const nickname = req.query.nickname;
    var query = { firstname: firstname, lastname: lastname, nickname: nickname };
    data.singer._id = await insertOne(c_singers, query);
    data.singer.firstname = firstname;
    data.singer.lastname = lastname;
    data.singer.nickname = nickname;
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/get_singer/:id', async function(req, res) {
  try {
    data = {
      "singer": {}
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singer = database.collection('c_singers');
    const singer_id = req.params.id;
    var query = { _id: new ObjectId(singer_id) };
    data.singer = await findByQuery(c_singer, query);
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/update_singer/:id', async function(req, res) {
  try {
    data = {
      "singer": ""
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singers = database.collection('c_singers');
    const singer_id = req.params.id;
    await c_singers.updateOne({_id: new ObjectId(singer_id)}, {$set: {firstname: req.query.firstname, lastname: req.query.lastname, nickname: req.query.nickname}});
    data._id = singer_id;
    data.firstname = req.query.firstname;
    data.lastname = req.query.lastname;
    data.nickname = req.query.nickname;
    res.send({data: data}); 
  } catch {
    await client.close();
  }
});

app.get('/save_folder/:name', async function(req, res) {
  try {
    let data = {
      "folder": {},
    }
    all_songs = [];
    count = 0;
    await client.connect();
    const database = client.db('db_karaoke');
    const c_folders = database.collection('c_folders');
    const c_files = database.collection('c_files');
    let path = req.query.path;
    path = path.replace(/\\/g, '/');
    if(path.charAt(path.length - 1) !== '/') {
      path += '/';
    }
    data.folder.name = req.params.name;

    const folders = await findByQuery(c_folders, "", "name");
    let check = false;
    if(folders[0]) {
      if(folders.some(item => item.name === req.params.name && item.path === path))
        check = true;
    }
    if(!check) {
      var query = { name: data.folder.name, path: path };
      data.folder.id = await insertOne(c_folders, query);
      await get_all_files(path + data.folder.name, data.folder.id);
	    console.log('saving...');
      for (const song of all_songs) {
        query = {folder_id: song.folder_id, artist: song.artist, name: song.name, length: song.length, path: song.path, play_count: 0, note: ""};
        await insertOne(c_files, query);
      }
      res.send({data: data});
	  console.log('sent to client');
    } else {
      res.send({data: 'duplicate'});
    }
  } catch {
    await client.close();
  }
});

app.get('/show_folder/:id', async function(req, res) {
  try {
    data = {
      "files": [],
      'total_count': 0
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_files = database.collection('c_files');
    const page = req.query.page;
    const page_size = parseInt(req.query.page_size);
    const search_artist = req.query.search_artist ? req.query.search_artist : '';
    const search_song = req.query.search_song ? req.query.search_song : '';
    const search_note = req.query.search_note ? req.query.search_note : '';
    const folder_id = req.params.id;
    var query = { folder_id: new ObjectId(folder_id), artist: new RegExp(search_artist, 'i'), name: new RegExp(search_song, 'i'), note: new RegExp(search_note, 'i') };
    data.total_count = await getCount(c_files, query);
    const sort_by = req.query.sort_by;
    const sort_order = parseInt(req.query.sort_order);
    var sort = {};
    if(sort_by == 'artist')
      sort = { artist: sort_order, name: 1 };
    else	
      sort = { name: sort_order, artist: 1 };
    var skip = page > 0 ? ( ( page - 1 ) * page_size ) : 0;
    data.files = await findBySongs(c_files, query, sort, skip, page_size);
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/show_public_playlist/:id', async function(req, res) {
  try {
    data = {
      "files": [],
      'total_count': 0
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_public_playlists = database.collection('c_public_playlists');
    const page = req.query.page;
    const page_size = parseInt(req.query.page_size);
    const search_artist = req.query.search_artist.trim() ? req.query.search_artist.trim() : '';
    const search_song = req.query.search_song.trim() ? req.query.search_song.trim() : '';
    const sort_by = req.query.sort_by;
    const sort_order = parseInt(req.query.sort_order);
    const playlist_id = req.params.id;
    var query = { _id: new ObjectId(playlist_id) };
    const public_playlists = await findByQuery(c_public_playlists, query);
    let files = public_playlists[0].songs;
    if(sort_by === 'artist') {
      if(sort_order === 1) {
        files.sort((a, b) => 
          a.artist.localeCompare(b.artist)
        )
      } else if(sort_order === -1) {
        files.sort((a, b) => 
          b.artist.localeCompare(a.artist)
        )
      }
    } else if(sort_by === 'name') {
      if(sort_order === 1) {
        files.sort((a, b) => 
          a.name.localeCompare(b.name)
        )
      } else if(sort_order === -1) {
        files.sort((a, b) => 
          b.name.localeCompare(a.name)
        )
      }
    }
    if(search_artist != '' || search_song != '') {
      let songs = [];
      for(const file of files) {
        if(file.artist.toLowerCase().includes(search_artist.toLowerCase()) && file.name.toLowerCase().includes(search_song.toLowerCase())) {
          songs.push(file);
        }
      }
      data.files = songs.slice(page_size * (page - 1), page_size * page);
      data.total_count = songs.length;
    } else {
      data.files = files.slice(page_size * (page - 1), page_size * page);
      data.total_count = files.length;
    }
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/show_all_public_playlist/:id', async function(req, res) {
  try {
    data = {
      "files": []
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_public_playlists = database.collection('c_public_playlists');
    const playlist_id = req.params.id;
    var query = { _id: new ObjectId(playlist_id) };
    const public_playlists = await findByQuery(c_public_playlists, query);
    data.files = public_playlists[0].songs;
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/show_singer_playlist/:id', async function(req, res) {
  try {
    data = {
      "files": [],
      'total_count': 0
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singer_playlists = database.collection('c_singer_playlists');
    const page = req.query.page;
    const page_size = parseInt(req.query.page_size);
    const search_artist = req.query.search_artist.trim() ? req.query.search_artist.trim() : '';
    const search_song = req.query.search_song.trim() ? req.query.search_song.trim() : '';
    const sort_by = req.query.sort_by;
    const sort_order = parseInt(req.query.sort_order);
    const playlist_id = req.params.id;
    var query = { _id: new ObjectId(playlist_id) };
    const singer_playlists = await findByQuery(c_singer_playlists, query);
    let files = singer_playlists[0].songs;
    if(sort_by === 'artist') {
      if(sort_order === 1) {
        files.sort((a, b) => 
          a.artist.localeCompare(b.artist)
        )
      } else if(sort_order === -1) {
        files.sort((a, b) => 
          b.artist.localeCompare(a.artist)
        )
      }
    } else if(sort_by === 'name') {
      if(sort_order === 1) {
        files.sort((a, b) => 
          a.name.localeCompare(b.name)
        )
      } else if(sort_order === -1) {
        files.sort((a, b) => 
          b.name.localeCompare(a.name)
        )
      }
    }
    if(search_artist != '' || search_song != '') {
      let songs = [];
      for(const file of files) {
        if(file.artist.toLowerCase().includes(search_artist.toLowerCase()) && file.name.toLowerCase().includes(search_song.toLowerCase())) {
          songs.push(file);
        }
      }
      data.files = songs.slice(page_size * (page - 1), page_size * page);
      data.total_count = songs.length;
    } else {
      data.files = files.slice(page_size * (page - 1), page_size * page);
      data.total_count = files.length;
    }
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/show_all_singer_playlist/:id', async function(req, res) {
  try {
    data = {
      "files": []
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singer_playlists = database.collection('c_singer_playlists');
    const playlist_id = req.params.id;
    var query = { _id: new ObjectId(playlist_id) };
    const singer_playlists = await findByQuery(c_singer_playlists, query);
    data.files = singer_playlists[0].songs;
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/queue_history/:date', async function(req, res) {
  try {
    data = {
      "queue": [],
      'total_count': 0
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_queue_history = database.collection('c_queue_history');
    const page = req.query.page;
    const page_size = parseInt(req.query.page_size);
    const search_artist = req.query.search_artist.trim() ? req.query.search_artist.trim() : '';
    const search_song = req.query.search_song.trim() ? req.query.search_song.trim() : '';
    const sort_by = req.query.sort_by;
    const sort_order = parseInt(req.query.sort_order);
    const queue_date = req.params.date;
    var query = { date: queue_date };
    var sort = { time: -1 };
    let files = await findByQuery(c_queue_history, query, sort);
    if(sort_by === 'artist') {
      if(sort_order === 1) {
        files.sort((a, b) => 
          a.artist.localeCompare(b.artist)
        )
      } else if(sort_order === -1) {
        files.sort((a, b) => 
          b.artist.localeCompare(a.artist)
        )
      }
    } else if(sort_by === 'name') {
      if(sort_order === 1) {
        files.sort((a, b) => 
          a.name.localeCompare(b.name)
        )
      } else if(sort_order === -1) {
        files.sort((a, b) => 
          b.name.localeCompare(a.name)
        )
      }
    }
    if(search_artist != '' || search_song != '') {
      let songs = [];
      for(const file of files) {
        if(file.artist.toLowerCase().includes(search_artist.toLowerCase()) && file.name.toLowerCase().includes(search_song.toLowerCase())) {
          songs.push(file);
        }
      }
      data.queue = songs.slice(page_size * (page - 1), page_size * page);
      data.total_count = songs.length;
    } else {
      data.queue = files.slice(page_size * (page - 1), page_size * page);
      data.total_count = files.length;
    }
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/get_singer_playlists/:singer_id', async function(req, res) {
  try {
    data = {
      "playlists": []
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singer_playlists = database.collection('c_singer_playlists');
    const singer_id = req.params.singer_id;
    var query = { singer_id: singer_id };
    data.playlists = await findByQuery(c_singer_playlists, query);
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/get_singers', async function(req, res) {
  try {
    data = {
      "singers": []
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singers = database.collection('c_singers');
    data.singers = await findByQuery(c_singers);
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/save_public_playlist/:name', async function(req, res) {
  try {
    data = {
      "playlist": {}
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_public_playlists = database.collection('c_public_playlists');
    const playlist_name = req.params.name;
    const public_playlists = await findByQuery(c_public_playlists);
    let check = false;
    if(public_playlists[0]) {
      if(public_playlists.some(item => item.name === playlist_name))
        check = true;
    }
    if(!check) {
      var query = { name: playlist_name, songs: [] };
      data.playlist.id = await insertOne(c_public_playlists, query);
      data.playlist.name = playlist_name;
      res.send({data: data});
    } else {
      res.send({data: "duplicate"});
    }
  } catch {
    await client.close();
  }
});

app.get('/save_song_in_public_playlist/:id', async function(req, res) {
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_public_playlists = database.collection('c_public_playlists');
    const playlist_id = req.params.id;
    const song_id = req.query.song_id
    const artist = req.query.artist;
    const song_name = req.query.song;
    const length = req.query.length;
    const song_path = req.query.path;
    const song_note = req.query.note;
    const song = {
      _id: song_id,
      artist: artist,
      name: song_name,
      length: length,
      path: song_path,
      note: song_note
    }
    const query = { _id: new ObjectId(playlist_id)}
    const public_playlists = await findByQuery(c_public_playlists, query);
    let songs = public_playlists[0].songs;
    if(!songs.some(item => item.path === song_path)) {
      await c_public_playlists.updateOne( { _id: new ObjectId(playlist_id) },
        [ { $set: { songs: { $concatArrays: [ "$songs", [ song ]  ] } } } ]
      )
      res.send({data: 'insert'});
    } else {
      res.send({data: 'duplicate'});
    }
  } catch {
    await client.close();
  }
});

app.get('/delete_public_playlist_song/:playlistId/:songId', async function(req, res) {
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_public_playlists = database.collection('c_public_playlists');
    await c_public_playlists.updateOne(
	  { _id : new ObjectId(req.params.playlistId) },
	  {$pull : {"songs" : {"_id": req.params.songId}}}
	)
	res.send({data: 'deleted'});
  } catch {
    await client.close();
	res.send({data: 'failed'});
  }
});

app.get('/delete_singer_playlist_song/:playlistId/:songId', async function(req, res) {
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singer_playlists = database.collection('c_singer_playlists');
    await c_singer_playlists.updateOne(
	  { _id : new ObjectId(req.params.playlistId) },
	  {$pull : {"songs" : {"_id": req.params.songId}}}
	)
	res.send({data: 'deleted'});
  } catch {
    await client.close();
	res.send({data: 'failed'});
  }
});

app.get('/save_song_in_singer_playlist/:id', async function(req, res) {
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singer_playlists = database.collection('c_singer_playlists');
    const playlist_id = req.params.id;
    const song_id = req.query.song_id
    const artist = req.query.artist;
    const song_name = req.query.song;
    const length = req.query.length;
    const song_path = req.query.path;
    const song_note = req.query.note;
    const song = {
      _id: song_id,
      artist: artist,
      name: song_name,
      length: length,
      path: song_path,
      note: song_note
    }
    const query = { _id: new ObjectId(playlist_id)}
    const singer_playlists = await findByQuery(c_singer_playlists, query);
    let songs = singer_playlists[0].songs;
    if(!songs.some(item => item.path === song_path)) {
      await c_singer_playlists.updateOne( { _id: new ObjectId(playlist_id) },
        [ { $set: { songs: { $concatArrays: [ "$songs", [ song ]  ] } } } ]
      )
      res.send({data: 'insert'});
    } else {
      res.send({data: 'duplicate'});
    }
  } catch {
    await client.close();
  }
});

function addZero(i) {
  if (i < 10) {i = "0" + i}
  return i;
}



app.get('/save_queue', async function(req, res) {
  try {
    data = {
      "queue": {}
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_queue_history = database.collection('c_queue_history');
    const dt = new Date();
    let y = dt.getFullYear();
    let m = addZero(dt.getMonth() + 1);
    let d = addZero(dt.getDate());
    let date = y + "-" + m + "-" + d;
    let h = addZero(dt.getHours());
    let mi = addZero(dt.getMinutes());
    let s = addZero(dt.getSeconds());
    let time = h + ':' + mi + ':' + s;
    var query = { song_id: req.query.song_id, singer_id: req.query.singer_id, singer_name: req.query.singer_name, artist: req.query.artist, name: req.query.song, length: req.query.length, path: req.query.file_path, note: req.query.note, date: date, time: time };
    data.queue._id = await insertOne(c_queue_history, query);
    data.queue.date = date;
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/save_singer_playlist/:name/:singer_id', async function(req, res) {
  try {
    data = {
      "playlist": {}
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singer_playlists = database.collection('c_singer_playlists');
    const playlist_name = req.params.name;
    const singer_id = req.params.singer_id;

    const singer_playlists = await findByQuery(c_singer_playlists);
    let check = false;
    if(singer_playlists[0]) {
      if(singer_playlists.some(item => item.name === playlist_name && item.singer_id === singer_id))
        check = true;
    }
    if(!check) {
      var query = { name: req.params.name, singer_id: singer_id, songs: [] };
      data.playlist._id = await insertOne(c_singer_playlists, query);
      data.playlist.name = playlist_name;
      data.playlist.singer_id = singer_id;
      res.send({data: data});
    } else {
      res.send({data: 'duplicate'});
    }
  } catch {
    await client.close();
  }
});

app.get('/singer_history/:id', async function(req, res) {
  try {
    data = {
      "singer_history": []
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_queue_history = database.collection('c_queue_history');
    const singer_id = req.params.id;
    var query = { singer_id: singer_id };
    var sort = { date: -1, time: -1 };
    data.singer_history = await findByQuery(c_queue_history, query, sort);
    res.send({data: data});
  } catch {
    await client.close();
  }
});

app.get('/video',async(req, res)=>{
  try {
    var pathname = req.query.path;

    const stat = fs.statSync(pathname)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize-1
      const chunksize = (end-start)+1
      const file = fs.createReadStream(pathname, {start, end})
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(200, head)
      fs.createReadStream(path).pipe(res)
    }
  } catch {
    await client.close();
  }
});

app.get('/videoname/:id',async(req, res)=>{
  try {
    data = {
      "files": []
    }
    await client.connect();
    const database = client.db('db_karaoke');
    const c_files = database.collection('c_files');
    const query = { _id: new ObjectId(req.params.id) }
    data = await findByQuery(c_files, query);
    res.send({data: data[0].artist + ' - ' + data[0].name });
  } catch {
    await client.close();
  }
});

app.get('/delete_folder/:id',async(req, res)=>{
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_folders = database.collection('c_folders');
    const c_files = database.collection('c_files');
    query = {_id: new ObjectId(req.params.id)}
    await deleteOne(c_folders, query);
    query = {folder_id: new ObjectId(req.params.id)}
    await deleteMany(c_files, query);
    res.send({data: 'ok'});
  } catch {
    await client.close();
  }
});

app.get('/delete_public_playlist/:id',async(req, res)=>{
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_public_playlists = database.collection('c_public_playlists');
    query = {_id: new ObjectId(req.params.id)}
    await deleteOne(c_public_playlists, query);
    res.send({data: 'ok'});
  } catch {
    await client.close();
  }
});

app.get('/delete_singer_playlist/:id',async(req, res)=>{
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singer_playlists = database.collection('c_singer_playlists');
    query = {_id: new ObjectId(req.params.id)}
    await deleteOne(c_singer_playlists, query);
    res.send({data: 'ok'});
  } catch {
    await client.close();
  }
});

app.get('/delete_queue_history/:date',async(req, res)=>{
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_queue_history = database.collection('c_queue_history');
    query = {date: req.params.date}
    await deleteMany(c_queue_history, query);
    res.send({data: 'ok'});
  } catch {
    await client.close();
  }
});

app.get('/delete_singer/:id',async(req, res)=>{
  try {
    await client.connect();
    const database = client.db('db_karaoke');
    const c_singers = database.collection('c_singers');
    query = {_id: new ObjectId(req.params.id)}
    await deleteOne(c_singers, query);
    res.send({data: 'ok'});
  } catch {
    await client.close();
  }
});
