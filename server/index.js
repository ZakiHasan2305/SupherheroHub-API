//require necessary modules
const express = require('express');
var Storage = require('node-storage');
const fs = require('fs');

//use node storage, link to json
var store = new Storage('./server/db.json');

//Create express application and assign port
const app = express();
const port = 3000;

//require the json files given in data
const heroInfo = require('./superhero_info.json');
const heroPower = require('./superhero_powers.json');

//static for front end
app.use('/', express.static('client'));

//use json format
app.use(express.json());

//middleware for logging
app.use((req,res,next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// Get all supeheroes
app.get('/api/hero',(req, res) => {
    res.send(heroInfo)
});

// Get all superhero powers
app.get('/api/hero_power', (req, res) => {
    res.send(heroPower)
});


// Get all superhero information for a given ID
app.get('/api/hero/:hero_id', (req, res) => {
    const id = req.params.hero_id;
    const hero = heroInfo.find(h => h.id === parseInt(id));
    if (hero) {
        res.send(hero);
    } else {
        res.status(404).send(`Hero ${id} was not found!`);
    }
});

// Get all powers for a given superhero ID
app.get('/api/hero_power/:hero_id', (req,res) => {
    const id = req.params.hero_id;
    const name = heroInfo.find(h => h.id === parseInt(id)).name;
    const power_object = heroPower.find(h => h.hero_names === name);

    if (name) {
        if (power_object) {
            const hero_powers = Object.keys(power_object).filter((prop) => prop !== "hero_names" && power_object[prop] === "True");
            res.json(hero_powers);
        } else {
            res.json(['-']);
        }
    } else {
        res.status(404).send(`Hero ${id} was not found!`);
    }
});

// Get all available publisher names
app.get('/api/hero_publisher', (req, res) => {
    const publishers_set = new Set();
    heroInfo.forEach((hero) => {
        publishers_set.add(hero.Publisher);
    });
    res.json(Array.from(publishers_set));
});

//Get first n number of heros matching field and pattern
app.get('/api/hero_pattern/:field/:pattern/:n?', (req, res) => {
    const field = req.params.field;
    const pattern = req.params.pattern.toLowerCase();
    let n = Number(req.params.n);
    if (isNaN(n)) {
        n = Infinity;
    }

    if (!heroInfo[0].hasOwnProperty(field)) {
        res.status(400).json({ message: `${field} does not exist!` });
    }

    const matching_heroID = []
    heroInfo.forEach((hero) => {
        if (matching_heroID.length < n) {
            if (hero[field].toLowerCase().startsWith(pattern)) {
                matching_heroID.push(hero.id);
            }
        }
    });

    if (matching_heroID.length) {
        console.log(matching_heroID)
        res.json(matching_heroID)
    } else {
        res.status(404).json({ message: `${pattern} not found!` });
    }
});

//Get all list names stored
app.get('/api/hero_db_names', (req, res) => {
    fs.readFile('server/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            const dataDb = JSON.parse(data);
            const names = Object.keys(dataDb);
            res.json(names);
        }
    });
});

//Get hero ID based on listName
app.get('/api/hero_db_id/:listName',(req, res) => {
    const listName = req.params.listName;
    const all_heroes = store.get(listName);
    if (all_heroes === null || all_heroes === undefined) {
        res.status(400).json({
            list_name:null,
            list_id:null,
            message: `List "${listName}" does not exist.`
        });

    } else {
        const all_hero_id = Object.keys(all_heroes).map(key => parseInt(key, 10));
        res.json({
            list_name: listName,
            list_id: all_hero_id,
            message: null
        });
    }
});

//Get hero info based on listName
app.get('/api/hero_db/:listName',(req, res) => {
    const listName = req.params.listName;
    const all_heroes = store.get(listName);
    console.log(all_heroes);
    if (all_heroes === null || all_heroes === undefined) {
        res.status(400).send(`List "${listName}" does not exist.`);
    } else {
        res.send(all_heroes);
    }
});

//Post to create a new list
app.post('/api/hero_db_create', (req, res) => {
    const list = req.body;
    const list_name = list.list_name;
    console.log(typeof list,list);
    console.log(typeof list_name,list_name);
    if (store.get(list_name) === null || store.get(list_name) === undefined) {
        store.put(list_name, {});
        res.send(`List ${list_name} was added`);
    } else {
        res.status(409).send(`List ${list_name} conflicts (already exists)`);
    }
});

//Post to add hero IDs and info to a list
app.post('/api/hero_db_add', (req, res) => {
    const list_name = req.body.list_name
    const ids = req.body.list_ids;
    console.log(list_name)
    console.log(ids);
    let heroNotFoundFlag = false;

    if (store.get(list_name) === null || store.get(list_name) === undefined) {
        res.status(400).json({message:`List ${list_name} does not exist!`});
    } else {
        for (id of ids) {
            const hero = heroInfo.find(h => h.id === parseInt(id));
            if (hero) {
                const power_object = heroPower.find(h => h.hero_names === hero.name);
    
                if (power_object) {
                    var hero_powers = Object.keys(power_object).filter((prop) => prop !== "hero_names" && power_object[prop] === "True");
                } else {
                   hero_powers = '-';
                }
                console.log(hero);
                console.log(hero_powers);
    
                store.put(`${list_name}.${id}`,hero);
                store.put(`${list_name}.${id}.Power`,hero_powers);
    
            } else {
                console.log(`Hero ${id} was not found!`);
                res.status(404).json({message:`Hero ${id} was not found!`});
                heroNotFoundFlag=true;
                break;
            }
        }
        if (!heroNotFoundFlag) {
            res.send(`Successfully added ${ids} to ${list_name}`);
        }
    }
});

//Post to delete a list
app.post('/api/hero_db_delete', (req, res) => {
    const list = req.body;
    const list_name = list.list_name;
    console.log(typeof list,list);
    console.log(typeof list_name,list_name);
    if (store.get(list_name) === null || store.get(list_name) === undefined) {
        res.status(400).send(`List ${list_name} does not exist!`);
    } else {
        store.remove(list_name);
        res.send(`List ${list_name} was deleted`);
    }
});


//Listen for requests on port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});