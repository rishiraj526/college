const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');

//middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/admin/login');
}

// Show all grievances
router.get('/admin',isAuthenticated, async (req, res) => {
  try {
    const grievances = await Grievance.find().sort({ createdAt: -1 });
    res.render('admin_dashboard', { grievances });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// View grievance by ID
router.get('/admin/view/:id',isAuthenticated, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    res.render('grievance_details', { grievance });
  } catch (err) {
    console.error(err);
    res.status(404).send('Grievance not found');
  }
});

// Update grievance status
router.post('/admin/update-status/:id', async (req, res) => {
  try {
    await Grievance.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
      remarks: req.body.remarks // Save remarks too
    });
    res.redirect('/admin/dashboard'); // Redirect to dashboard
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating status');
  }
});

// Admin dashboard with filter by status
router.get('/admin/dashboard', isAuthenticated, async (req, res) => {
  try {
    const statusFilter = req.query.status || '';
    const query = statusFilter ? { status: statusFilter } : {};
    const grievances = await Grievance.find(query).sort({ createdAt: -1 });
    res.render('admin_dashboard', { grievances, statusFilter });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Admin updates grievance status
router.post('/admin/update-status/:id', async (req, res) => {
  const { status } = req.body;
  await Grievance.findByIdAndUpdate(req.params.id, { status });
  res.redirect('/admin/dashboard'); // or wherever
});

module.exports = router;
