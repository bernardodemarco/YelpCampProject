const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary/index');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            required: true,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [ImageSchema],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    author: { type: Schema.Types.ObjectId, ref: 'User' }
}, opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
});

campgroundSchema.post('findOneAndRemove', async function (campground) {
    if (campground && campground.reviews.length !== 0) {
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        })
    }
    if (campground && campground.images.length !== 0) {
        for (let image of campground.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
    }
})

module.exports = mongoose.model('Campground', campgroundSchema);