const Membership = require('../Models/memebershipModel');

exports.submitMembership = async (req, res) => {
  try {
    const membership = new Membership(req.body);
    await membership.save();
    res.status(200).json({ message: 'Membership submitted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting membership', error: error.message });
  }
};
