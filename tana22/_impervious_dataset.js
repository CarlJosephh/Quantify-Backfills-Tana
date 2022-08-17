var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_watershed')

var dataset = ee.Image("Tsinghua/FROM-GLC/GAIA/v10");

var visualization = {
  bands: ['change_year_index'],
  min: 1,
  max: 34,
  palette: [
    "014352","1A492C","071EC4","B5CA36","729EAC","8EA5DE",
    "818991","62A3C3","CCF4FE","74F0B9","32BC55","C72144",
    "56613B","C14683","C31C25","5F6253","11BF85","A61B26",
    "99FBC5","188AAA","C2D7F1","B7D9D8","856F96","109C6B",
    "2DE3F4","9A777D","151796","C033D8","510037","640C21",
    "31A191","223AB0","B692AC","2DE3F4",
  ]
};

Map.setCenter(47.5, -18.9, 14);

Map.addLayer(dataset, visualization, "Change year index", false);
print(dataset)

var impervious2012  = dataset.gte(7)//as ref to increase in 2013
//Map.addLayer(impervious2012, '', 'impervious in 2012')
//print(impervious2012)
/*var impervious2013 = dataset.gte(6) //
var impervious2014 = dataset.gte(5)
var impervious2015 = dataset.gte(4)
var impervious2016 = dataset.gte(3)
var impervious2017 = dataset.gte(2)
var impervious2018 = dataset.gte(1)*/

//List with desired year codes to aid in the following function
var names = ee.List.sequence(1,33,1).reverse()
print(names)
//function to create masked separate images for the yearly increases
function increment(num){
  //get image for every year contained in List(names)
  var image = ee.Image(dataset.eq(ee.Number(num))).selfMask()
  //name the image with the actual year o change to impervious
  var incr = image.set('system:id', ee.Number(2019).subtract(ee.Number(num)))
  
  return incr
}

//run function to create yearly increase images
var impervius_increases = names.map(increment)
print(impervius_increases, 'impervius_increases')

//check the difference of image.eq and image.gt
//Map.addLayer(ee.Image(impervius_increases.filter(ee.Filter.eq('system:id', 2014)).get(0)), {palette:'FF5750'}, '2014 increase')
Map.addLayer(ee.Image(dataset.gt(10)).selfMask(), {palette:['3358FF']}, 'impervious in 2009', false)
Map.addLayer(ee.Image(dataset.eq(10)).selfMask(), {palette:['FF5750']}, 'change to impervious in 2009', false)
Map.addLayer(ee.Image(dataset.eq(1)).selfMask(), {palette:['FF5750']}, 'change to impervious in 2018')
Map.addLayer(ee.Image(dataset.eq(2)).selfMask(), {palette:['FF5750']}, 'change to impervious in 2017')

Map.addLayer(ee.Image(dataset.gte(1)).selfMask(), {palette:['FF5750']}, 'change to impervious in 2018')
Map.addLayer(ee.Image(dataset.gte(20)).selfMask(), {palette:['FF5750']}, 'change to impervious in 20')

//function to calculate annual area increase of impervious areas
function area(image){
  var geom = ee.Image(image).reduceToVectors({reducer: ee.Reducer.countEvery(),
                                              geometryType: 'polygon',
                                              /*crs: ee.Image(image).projection(),*/
                                              scale: 30, 
                                              geometry: viable, 
                                              labelProperty: null , 
                                              bestEffort: true, //If the polygon would contain too many pixels at the given scale, compute and use a larger scale which would allow the operation to succeed.
                                              eightConnected:true, //If true, diagonally-connected pixels are considered adjacent; otherwise only pixels that share an edge are
                                              geometryInNativeProjection: true //Create geometries in the pixel projection, rather than WGS84.
  })
   .geometry()
   .area({maxError: 1})
   
   return geom
}
//run area calculaiton function
//var imperviousList = impervius_increases.toList(impervius_increases.size())
var areaIncrM = impervius_increases.map(area)
print(areaIncrM, 'areaIncr')



//create an array from area values and convert tm2 to km2
var areaIncrKm = ee.Array(areaIncrM).multiply(0.000001)

//create yearly steps for the year before, since backfill takes place in the dry season before the rainy season, which the image is taken from (e.g. RS 2014 image shows backfills during 2013)
var years = ee.List.sequence(1986, 2018, 1);  // // [0,2,4,6,8,10]
var chart = ui.Chart.array.values({array: areaIncrKm, axis: 0 , xLabels: years })
                .setOptions({
                  title: 'Yearly increase of impervious area',
                  colors: ['1d6b99'],
                  pointSize: 10,
                  hAxis: {
                    'title': 'Year',
                    titleTextStyle: {italic: false, bold: true},
                    viewWindow: {min: 1991, max: 2018},
                    gridlines: {count: 9}
                  },
                  vAxis: {
                    'title': 'impervious area increase [km2]',
                    titleTextStyle: {italic: false, bold: true}
                  }
                });
print(chart,'Rate of impervious area increase')