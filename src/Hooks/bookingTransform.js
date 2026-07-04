export const getBookingTypeLabel = type => {
  const types = { 1: 'Motorcycle', 2: 'Tricycle', 3: 'Car' };
  return types[type] || 'Ride';
};

export const getBookingTypeImage = type => {
  const images = {
    1: require('@/Assets/Common/HomeScreen/Motorcycle.png'),
    2: require('@/Assets/Common/HomeScreen/Car.png'),
    3: require('@/Assets/Common/HomeScreen/Car.png'),
  };
  return images[type] || require('@/Assets/Common/HomeScreen/Motorcycle.png');
};

export const getStatusLabel = status => {
  const statuses = {
    0: 'Pending',
    1: 'Accepted',
    2: 'On the way',
    3: 'Completed',
    4: 'Cancelled',
  };
  return statuses[status] || 'Unknown';
};

export const capitalizeFirst = str => {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getRiderName = riderDetails => {
  if (!riderDetails || Object.keys(riderDetails).length === 0) {
    return 'No rider assigned';
  }

  const { first_name = '', middle_name = '', last_name = '' } = riderDetails;
  let fullName = `${first_name} ${middle_name} ${last_name}`.trim();

  // Fall back to eKYC name if the top-level rider name fields are blank
  if (!fullName && riderDetails.ekyc_details) {
    const {
      first_name: ekycFirst = '',
      middle_name: ekycMiddle = '',
      last_name: ekycLast = '',
    } = riderDetails.ekyc_details;
    fullName = `${ekycFirst} ${ekycMiddle} ${ekycLast}`.trim();
  }

  return fullName || 'Unknown Rider';
};

export const transformBooking = booking => ({
  ...booking,
  title: getBookingTypeLabel(booking.booking_type),
  image: getBookingTypeImage(booking.booking_type),
  status: booking.pretty_status || getStatusLabel(booking.status),
  destination: booking.dropoff_location,
  pickup: booking.pickup_location,
  date: `${booking.date_created} - ${booking.time_created}`,
  price: booking.payment_details?.total_amount?.toFixed(2) || '0.00',
  bookingId: booking.ref_code,
  paymentMethod: capitalizeFirst(booking.payment_type),
  riderName: getRiderName(booking.rider_details),
  riderRating: booking.booking_ratings?.rate
    ? parseFloat(booking.booking_ratings.rate)
    : null,
});
