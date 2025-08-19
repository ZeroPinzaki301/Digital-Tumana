import TumanaBachelor from '../models/TumanaBachelor.model.js';
import TesdaEnrollment from '../models/TesdaEnrollment.model.js';
import { uploadToCloudinary } from '../config/cloudinary.js'; // make sure this is imported

export const createBadge = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrollment = await TesdaEnrollment.findOne({ userId });
    if (!enrollment) {
      return res.status(404).json({ message: 'TESDA enrollment not found.' });
    }

    if (enrollment.status !== 'graduated') {
      return res.status(403).json({ message: 'User has not graduated yet.' });
    }

    const existingBadge = await TumanaBachelor.findOne({ userId });
    if (existingBadge) {
      return res.status(409).json({ message: 'Badge already created.' });
    }

    // ✅ Upload profile picture to Cloudinary
    let profileUrl = 'default-profile.png';
    if (req.file?.path) {
      const cloudinaryRes = await uploadToCloudinary(req.file.path, "tumana_badges");
      profileUrl = cloudinaryRes.secure_url;
    }

    const badge = new TumanaBachelor({
      userId,
      firstName: enrollment.firstName,
      lastName: enrollment.lastName,
      profilePicture: profileUrl
    });

    await badge.save();
    res.status(201).json({ message: 'Badge created successfully.', badge });

  } catch (error) {
    console.error('Error creating badge:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getBadge = async (req, res) => {
  try {
    const userId = req.user._id;

    const badge = await TumanaBachelor.findOne({ userId });

    if (!badge) {
      return res.status(404).json({ message: 'Badge not found.' });
    }

    res.status(200).json({ badge });

  } catch (error) {
    console.error('Error fetching badge:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};