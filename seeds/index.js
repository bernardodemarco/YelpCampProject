const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('CONECTED TO THE DATABASE!!!');
    })
    .catch((err) => {
        console.log('ERROR!!!', err);
    })

const sample = list => list[Math.floor(Math.random() * list.length)];

const seedDB = async function () {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const num = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[num].city}, ${cities[num].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam eligendi voluptatibus aliquam, quis eum quae ad fuga aspernatur fugit, laudantium ratione molestiae consequatur commodi voluptatum dolorem omnis expedita magnam obcaecati!',
            price,
            author: '631647b875f7dfa911a26a44',
            images: [
                {
                    url: 'https://res.cloudinary.com/ddqcnenij/image/upload/v1663187026/YelpCamp/zz3x4gksvxms1cscbedi.jpg',
                    filename: 'YelpCamp/zz3x4gksvxms1cscbedi'
                },
                {
                    url: 'https://res.cloudinary.com/ddqcnenij/image/upload/v1663187026/YelpCamp/tbnydjcm5ado9aml4xqm.jpg',
                    filename: 'YelpCamp/tbnydjcm5ado9aml4xqm'
                }
            ],
            geometry: { type: 'Point', coordinates: [cities[num].longitude, cities[num].latitude] }
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})