const express = require('express');
var Storage = require('node-storage');

var store = new Storage('./server/db.json');
const app = express();
const port = 3000;
const router = express.Router();

const heroInfo = require('./superhero_info.json');
const heroPower = require('./superhero_powers.json');

//set-up front end
app.use('/', express.static('client'));

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
    const pattern = req.params.pattern;
    let n = Number(req.params.n);
    if (isNaN(n)) {
        n = Infinity;
    }

    if (!heroInfo[0].hasOwnProperty(field)) {
        res.status(400).send(`${field} does not exist!`);
    }

    const matching_heroID = []
    heroInfo.forEach((hero) => {
        if (matching_heroID.length < n) {
            if (hero[field].includes(pattern)) {
                matching_heroID.push(hero.id);
            }
        }
    });

    // if (matching_heroID.length) {
        res.json(matching_heroID)
    // } else {
    //     res.status(404).send(`${pattern} not found!`)
    // }
});


//Get hero ID based on listName
app.get('/api/hero_db_id/:listName',(req, res) => {
    const listName = req.params.listName;
    const all_heroes = store.get(listName);
    if (all_heroes === null || all_heroes === undefined) {
        res.status(400).send(`List "${listName}" does not exist.`);
    } else {
        const all_hero_id = Object.keys(all_heroes).map(key => parseInt(key, 10));
        res.send(all_hero_id);
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
app.post('/api/hero_db/:listName', (req, res) => {
    const listName = req.params.listName;
    if (store.get(listName) === null || store.get(listName) === undefined) {
        store.put(listName, {});
        res.send(`List ${listName} was added`);
    } else {
        res.status(409).send(`List ${listName} conflicts (already exists)`);
    }
});

//Post to add hero IDs and info to a list
app.post('/api/hero_db/:listName/:ids', (req, res) => {
    const listName = req.params.listName;
    const ids = req.params.ids.split(',');
    let heroNotFoundFlag = false;
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

            store.put(`${listName}.${id}`,hero);
            store.put(`${listName}.${id}.Power`,hero_powers);

        } else {
            console.log(`Hero ${id} was not found!`)
            res.status(404).send(`Hero ${id} was not found!`);
            heroNotFoundFlag=true;
            break;
        }
    }
    if (!heroNotFoundFlag) {
        res.send(`Successfully added ${ids} to ${listName}`);
    }
});

//Post to delete a list
app.post('/api/hero_db_delete/:listName', (req, res) => {
    const listName = req.params.listName;
    if (store.get(listName) === null || store.get(listName) === undefined) {
        res.status(404).send(`List ${listName} not found!`);
    } else {
        store.remove(listName);
        res.send(`List ${listName} was deleted.`);
    }
});


//Listen for requests on port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});