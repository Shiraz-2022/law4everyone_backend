const opencage = require("opencage-api-client");

const geoCode = async (address) => {
  let location;

  await opencage.geocode({ q: address }).then((data) => {
    if (data.status.code === 200 && data.results.length > 0) {
      const place = data.results[0];
      location = place.geometry;
    } else {
      console.log("Status", data.status.message);
      console.log("total_results", data.total_results);
    }
  });

  return location;
};

module.exports = geoCode;
