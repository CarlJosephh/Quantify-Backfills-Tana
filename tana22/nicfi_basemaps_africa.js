var nicfi = ee.ImageCollection('projects/planet-nicfi/assets/basemaps/africa');

// Filter basemaps by date and get the first image from filtered results
var basemap= nicfi.filter(ee.Filter.date('2016-10-01','2017-05-31'))//.first();
basemap = basemap.median()
print(basemap, 'basemap')

Map.setCenter(47.5, -18.8, 12)

var vis = {"bands":["R","G","B"],"min":64,"max":5454,"gamma":1.8};

Map.addLayer(basemap, vis, '2021-03 mosaic');
Map.addLayer(
    basemap.normalizedDifference(['N','R']).rename('NDVI'),
    {min:-0.55,max:0.8,palette: [
        '8bc4f9', 'c9995c', 'c7d270','8add60','097210'
    ]}, 'NDVI', false);


var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_areas')



Export.image.toDrive({
  image: basemap.select(['B', 'G', 'R', 'N']), 
  description: 'NICFIbasemap21', 
  folder: 'GEE', 
  region: GT, 
  scale:4.77,
  /*crs: projection3.crs,
  crsTransform: projection3.transform,*/
  
})