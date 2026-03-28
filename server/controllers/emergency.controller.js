import Doctor from '../models/Doctor.model.js';
import Chemist from '../models/Chemist.model.js';

export async function getOnlineDoctors(_req, res, next) {
  try {
    const doctors = await Doctor.find({ isOnline: true }).limit(3).select('name specialization');
    res.json({
      success: true,
      doctors: doctors.map((doctor) => ({ id: doctor._id, name: doctor.name, specialization: doctor.specialization })),
    });
  } catch (error) {
    next(error);
  }
}

export async function getNearbyServices(req, res, next) {
  try {
    const { lat, lng } = req.query;
    const latitude = Number(lat);
    const longitude = Number(lng);

    const chemists = await Chemist.find({
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [longitude || 77.5946, latitude || 12.9716] },
          $maxDistance: 20000,
        },
      },
    })
      .limit(3)
      .select('shopName address phone');

    const services = [
      ...chemists.map((chemist, index) => ({
        name: chemist.shopName,
        address: chemist.address || chemist.city || 'Nearby pharmacy',
        phone: chemist.phone,
        distance: `${(index + 1) * 1.2} km`,
      })),
      { name: 'AID City Hospital', address: 'Emergency Wing, Central Avenue', phone: '1800112112', distance: '2.4 km' },
      { name: 'RapidCare Clinic', address: '24x7 Trauma Support, Ring Road', phone: '1800222112', distance: '3.1 km' },
    ].slice(0, 5);

    res.json({ success: true, services });
  } catch (error) {
    next(error);
  }
}
