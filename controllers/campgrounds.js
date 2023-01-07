const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary/index');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const { title, location, price, description } = req.body.campground;
    const geoData = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send();
    const campground = new Campground({ title, location, price, description, author: req.user._id });
    campground.images = req.files.map(el => {
        return {
            url: el.path,
            filename: el.filename
        };
    });
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const { title, location, image, price, description } = req.body.campground;
    const campground = await Campground.findByIdAndUpdate(id, { title, location, image, price, description });
    const newImages = req.files.map(el => {
        return {
            url: el.path,
            filename: el.filename
        };
    });
    campground.images.push(...newImages);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        };
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    };
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndRemove(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};