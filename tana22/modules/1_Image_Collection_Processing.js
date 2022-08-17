/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var watershed = 
    /* color: #0002d6 */
    /* shown: false */
    ee.Geometry.LineString(
        [[47.453623541383244, -19.00655390467706],
         [47.45396686413715, -18.994867705138258],
         [47.449846991090276, -18.98610251698113],
         [47.441607244996526, -18.975713548403082],
         [47.43079257824848, -18.949332398155445],
         [47.42914030300554, -18.94576046448419],
         [47.428346342099516, -18.944380382239732],
         [47.426415128653595, -18.94259438584807],
         [47.42559974234844, -18.941193984504253],
         [47.4244410488879, -18.939955944196107],
         [47.42135120251606, -18.938291663213032],
         [47.415171392945744, -18.93350170553674],
         [47.41551471569965, -18.925707582511887],
         [47.411394842652776, -18.91596441749476],
         [47.407189061398235, -18.912554233617993],
         [47.40075183728168, -18.911092622042666],
         [47.3907954774184, -18.911092622042666],
         [47.37912250378559, -18.910118245920746],
         [47.37259937146137, -18.90394706533585],
         [47.376719244508244, -18.898100473752642],
         [47.38358569958637, -18.89452745612319],
         [47.38753391125629, -18.890142284799637],
         [47.39088133474198, -18.88689381095431],
         [47.396202810792424, -18.886000628650567],
         [47.4043996615606, -18.88336127567948],
         [47.40650249340961, -18.87593029236919],
         [47.40311215297438, -18.87223467743792],
         [47.40073042517328, -18.867787962527558],
         [47.401033539712905, -18.864511207846906],
         [47.40202327254216, -18.86204664949355],
         [47.402088984554354, -18.860733152885746],
         [47.40129639783793, -18.858282542952118],
         [47.40022623287441, -18.855980449737753],
         [47.40048905833836, -18.855112498213582],
         [47.40487171032856, -18.852620015682504],
         [47.4153430543227, -18.842710136417605],
         [47.41980630289699, -18.84043566950268],
         [47.422381170777776, -18.83767374407641],
         [47.426157721070744, -18.833774497885543],
         [47.430363424806096, -18.826869360705892],
         [47.43508411267231, -18.82516334192368],
         [47.43817401745746, -18.822401179559478],
         [47.44298053601215, -18.817201691978486],
         [47.4471862397475, -18.815008109927277],
         [47.4497611604018, -18.811514568328285],
         [47.45293689587543, -18.804852264619456],
         [47.45465350964496, -18.799002219457407],
         [47.45654182031727, -18.796524026263263],
         [47.46066165783832, -18.795020822440822],
         [47.46563983776996, -18.783726143048998],
         [47.46838641980121, -18.775274952370808],
         [47.469073065309026, -18.76617319616993],
         [47.46838641980121, -18.757396037407062],
         [47.46701312878559, -18.751219244533832],
         [47.45843005993793, -18.75219454264988],
         [47.45499683239887, -18.750569042658707],
         [47.45448184826801, -18.747480549547127],
         [47.45298179293459, -18.742440561836112],
         [47.45086404832815, -18.73782927244253],
         [47.44977892073752, -18.734849308364616],
         [47.44840596632912, -18.73049281849187],
         [47.445994957899735, -18.726401338316084],
         [47.445236623318486, -18.721915559562945],
         [47.44485955068409, -18.718379988109344],
         [47.44379592755268, -18.71256852300701]]),
    watershed_poly = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[47.45042397741026, -19.017557635645073],
          [47.46323205889908, -19.120702222951955],
          [47.64601876247696, -19.131078952632155],
          [47.71335527679473, -18.910076103972646],
          [47.60270170825546, -18.696229815561953],
          [47.477488805303516, -18.7186675480581],
          [47.45534448746651, -18.75069306516454],
          [47.46032266744554, -18.751505816527526],
          [47.46701746121042, -18.75134326656795],
          [47.468562413617875, -18.762071228029495],
          [47.46873407499655, -18.76776002167716],
          [47.46821909086089, -18.77442379299505],
          [47.466502477075096, -18.780777798715327],
          [47.4630692495034, -18.787766085470757],
          [47.46032266744604, -18.79491659038011],
          [47.45534448746694, -18.798329224305427],
          [47.451739598516596, -18.806941754623555],
          [47.44714757937597, -18.815005555560774],
          [47.44234106077537, -18.818092811060488],
          [47.43547460563165, -18.82491706941985],
          [47.429809780138044, -18.827191760635873],
          [47.426033229808944, -18.83291897179211],
          [47.42431665116316, -18.834421824262304],
          [47.42302920329986, -18.835965273143312],
          [47.42180610315299, -18.837569639274214],
          [47.4208404731064, -18.839336465785774],
          [47.416935176743344, -18.841651577478],
          [47.41178533538541, -18.845875558660765],
          [47.40440389610569, -18.85221133114323],
          [47.39994070026211, -18.854973003265272],
          [47.399704661321366, -18.85639442917846],
          [47.401013583878296, -18.857815853555575],
          [47.40157147787245, -18.859562143180188],
          [47.401914806115855, -18.86138965413921],
          [47.40070201295741, -18.865016197767748],
          [47.40121699709312, -18.869402026820097],
          [47.40653849982954, -18.87589934042739],
          [47.404821886043415, -18.883208517127333],
          [47.39093520250211, -18.886619357118075],
          [47.3833821018435, -18.894415301947486],
          [47.376000662563555, -18.89831313822816],
          [47.37222411223415, -18.903997320078748],
          [47.3784039218636, -18.909518911823135],
          [47.386815329415036, -18.910980479129037],
          [47.40106322383897, -18.910980479129336],
          [47.406728049332806, -18.912279639344984],
          [47.411534567933586, -18.91617705943313],
          [47.41496779550551, -18.925757830924898],
          [47.41495205751887, -18.933765739153664],
          [47.42473675609923, -18.93977345133434],
          [47.42902829056431, -18.945293861140858],
          [47.4412162484453, -18.975652850431015],
          [47.44988514806504, -18.98616356482445],
          [47.45400502115174, -18.994888171355193],
          [47.453618783049954, -19.006614945216594]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//import boundary layer Greater Tana (Dupuy et al. 2020)
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana');
GT = GT.geometry()
//set Map center to ROI
Map.centerObject(GT, 12)

//___________________________________________________________________________________________________________
// Create a mask for Region Of Interest (ROI)
//Load USGS DEM
var DEM = ee.Image('USGS/SRTMGL1_003');
//print(DEM)

//create raster containing 'elevation' and clip it to GT region
var elevation = DEM.select('elevation');
var elevation = elevation.clip(GT).clip(watershed_poly);
//Map.addLayer(elevation, {min:1235, max:1500,  palette:['572F22', '7F574B', 'B6988F', 'FFF3EF']}, false)

//use the following to calculate minima and maxima of the image in the ROI
/*var minMaxValues = elevation.reduceRegion({reducer: ee.Reducer.minMax(), geometry: GT});
print('minMaxValues', minMaxValues)*/

//WWF Hydro basins
var hydrobasins = ee.FeatureCollection('WWF/HydroSHEDS/v1/Basins/hybas_9');

var visualization = {
  color: '808080',
  strokeWidth: 1
};

hydrobasins = hydrobasins.draw(visualization);
//Map.addLayer(hydrobasins, null, 'Basins');


//calculate slope
var slope = ee.Terrain.slope(elevation);

//create layer with elevation viable for rice cultivation
var lowlands = elevation.lte(1260)
  .selfMask()
  .rename('lowlands');


//create layer with slope viable for rice cultivation and reduce it to Vector
var flatlands = slope.lte(10)
  .selfMask()
  .rename('flatlands')

var flatgeo = flatlands.reduceToVectors({geometry: GT, scale: 30, labelProperty: null })

//clip the viable elevation layer to the viable slope layer
var viable = lowlands.clip(flatgeo)

//reduce combined viable (slope and elevation) layer to Vector and add to map
var viablegeo = viable.reduceToVectors({geometry: GT, scale: 30, labelProperty: null})
Map.addLayer(viablegeo,{color: 'fFfFfF'}, 'viable areas', false)

Export.table.toAsset({collection: viablegeo,
                      description: 'ROI',
                      assetId: 'viable_watershed'})


//___________________________________________________________________________________________________________
//IMPORT IMAGES

//Filter image collection

/*var image = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1')
  .filterBounds(GT)
  .filterDate('2020-05-01', '2020-06-01')
  .sort('CLOUD_COVER') //sorts for the earliest and least cloudy image 
  .first());*/
  
var dataset = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
    .filterBounds(GT)
    //.filterDate('2016-10-01', '2017-05-01')
    //.filter(ee.Filter.calendarRange(2016, 2014, 'year'))  
    .filter(ee.Filter.calendarRange(10, 5, 'month'))
//print(dataset, 'dataset')

function ROICC (image) {//###FUNCTION SEEMS TO ONLY WORK FOR TOA IMAGES
  var cloud = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');//'cloud'
  var cloudiness = cloud.reduceRegion({
    reducer: 'mean', 
    geometry: GT, 
    scale: 30,
  });
  return image.set(cloudiness);
}


function maskL8sr(image) {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Cirrus
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
  var saturationMask = image.select('QA_RADSAT').eq(0);

  // Replace the original bands with the scaled ones and apply the masks.
  return image
      .updateMask(qaMask)
      .updateMask(saturationMask);
}

var withCloudiness = dataset.map(ROICC).map(maskL8sr)

    //adjust boundary value for CC filtering
var cloudfreeImage = withCloudiness.filter(ee.Filter.lte('cloud', 25));//'cloud'
//print(cloudfreeImage, 'fC', false);

//Load Images
//for 06 an 05 2019, 2017 and 2016 have oo high CC, 17 and 16 little better in July but still problematic
var Landsat22 = cloudfreeImage.filterDate('2021-10-01', '2022-05-01').median().set('system:id', '2022')//ee.String(cloudfreeImage.filterDate('2021-10-01', '2022-05-01').first().get('system:id')).slice(-8))
var Landsat21 = cloudfreeImage.filterDate('2020-10-01', '2021-05-01').median().set('system:id', '2021') //ee.String(cloudfreeImage.filterDate('2020-10-01', '2021-05-01').first().get('system:id')).slice(-8)) //ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210530');//(")may2021
var Landsat20 = cloudfreeImage.filterDate('2019-10-01', '2020-05-01').median().set('system:id', '2020') //ee.String(cloudfreeImage.filterDate('2019-10-01', '2020-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20200527');//(")May 2020 (LC08_L1TP_159073_20200628_20200708_01_T1 ; LC08_L1TP_159073_20200714_20200722_01_T1)
var Landsat19 = cloudfreeImage.filterDate('2018-10-01', '2019-05-01').median().set('system:id', '2019') //ee.String(cloudfreeImage.filterDate('2018-10-01', '2019-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20190610');//(")!!! June 2019 ,LC08_159073_20190610, <--highCC
var Landsat18 = cloudfreeImage.filterDate('2017-10-01', '2018-05-01').median().set('system:id', '2018') //ee.String(cloudfreeImage.filterDate('2017-10-01', '2018-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20180506');//(")May 2018 (LC08_L1TP_159073_20180607_20180615_01_T1 ; LC08_L1TP_159073_20180623_20180703_01_T1)
var Landsat17Collection = cloudfreeImage.filterDate('2016-10-01', '2017-05-01')
var Landsat17 = cloudfreeImage.filterDate('2016-10-01', '2017-05-01').median().set('system:id', '2017') //ee.String(cloudfreeImage.filterDate('2016-10-01', '2017-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170620');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170706')!!! LC08_159073_20170620<-- highCC
var Landsat16 = cloudfreeImage.filterDate('2015-10-01', '2016-05-01').median().set('system:id', '2016') //ee.String(cloudfreeImage.filterDate('2015-10-01', '2016-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20160617');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20160719')July 2016
var Landsat15 = cloudfreeImage.filterDate('2014-10-01', '2015-05-01').median().set('system:id', '2015') //ee.String(cloudfreeImage.filterDate('2014-10-01', '2015-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20150615');//(")June 2015
var Landsat14 = cloudfreeImage.filterDate('2013-10-01', '2014-05-01').median().set('system:id', '2014') //ee.String(cloudfreeImage.filterDate('2013-10-01', '2014-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20140527');//(")may2014
var Landsat13 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609')/*cloudfreeImage.filterDate('2012-10-01', '2013-05-01').median()*/.set('system:id', '2013') //ee.String(cloudfreeImage.filterDate('2012-10-01', '2013-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609');//(")may2014

var LS8export = ee.ImageCollection.fromImages([
  Landsat22,
  Landsat21,
  Landsat20,
  Landsat19,
  Landsat18,
  Landsat17,
  Landsat16,
  Landsat15,
  Landsat14,
  Landsat13
]);
print('LS8export: ', LS8export);

//___________________________________________________________________________________________________________
//IMAGE PREPROCESSING, Band calculations and clipping to region of interest
//load DEM
var elevation = ee.Image('USGS/SRTMGL1_003').clip(viablegeo).select('elevation');
var slope = ee.Terrain.slope(elevation)
//function for clipping and calculating complex and simple band ratios
function process(image){
  //clipping the image
  var image = image.clip(viablegeo);
  //band names
  //!!!PAY ATTENTION TO USE THE RIGHT BAND VALUES WHEN USING DATA FROM DIFFERENT LANDSAT MISSIONS!!!
  var bn = {
      'BLUE':   image.select('B2'),
      'GREEN':  image.select('B3'),
      'RED':    image.select('B4'),
      'NIR':    image.select('B5'),
      'SWIR1':  image.select('B6'),
      'SWIR2':  image.select('B7')}
  //complex band calculations
  var BSI = image.expression(//Bare Soil Index Diek et al. 2017
    '((RED + SWIR2) - (NIR + BLUE)) / ((RED + SWIR2) + (NIR + BLUE))', bn) //Barest Pixel Composite for Agricultural Areas Using Landsat Time Series
    .rename('BSI');
  var NDVI = image.expression(//Normalised Difference Vegetation Index
    '(NIR - RED)/(NIR + RED)', bn)
    .rename('NDVI');
  var SCI = image.expression(//Soil Composition Index (SCI)
    '(SWIR1 - NIR)/(SWIR1 + NIR)', bn)
    .rename('SCI');
  var SBL = image.expression(//Soil Background Line (SBL)
    'NIR - (2.4*RED)', bn)
    .rename('SBL');
  var NDBI =image.expression(//Normalized Difference Built up Index :Zha, Y., J. Gao, and S. Ni. "Use of Normalized Difference Built-Up Index in Automatically Mapping Urban Areas from TM Imagery." International Journal of Remote Sensing 24, no. 3 (2003): 583-594
    '(SWIR1 - NIR) / (SWIR1 + NIR)', bn)
    .rename('NDBI')
  var NDWI = image.expression(//NDWI = (Band 3 – Band 5)/(Band 3 + Band 5)
    '(GREEN - NIR) / (GREEN + NIR)', bn)
    .rename('NDWI')
  //simple single band calculation
  //(Landsat data Ratios 1 - 3 from: May 2015 DOI:10.5194/isprsarchives-XL-7-W3-897-2015, Mwaniki et al. 2015)
  var Br4_3 = image.expression(//Mwaniki et al. 2015
    'RED / GREEN',bn)
    .rename('Br4_3')
  var Br6_2 = image.expression(//Mwaniki et al. 2015
    'SWIR1 / BLUE',bn)
    .rename('Br6_2') 
  var Br7_3 = image.expression(//Mwaniki et al. 2015 //change RED to Green
    'SWIR2 / RED',bn)
    .rename('Br7_3')
  var Br5_7 = image.expression(//Thi et al. 2019
    'NIR / SWIR2',bn)
    .rename('Br5_7')
  var Br5_4_3 = image.expression(
    '(NIR / RED / GREEN)', bn)
    .rename('Br5_4_3')
    //new indices use or not? 
   var RI = image.expression(//Redness index
    '(RED * RED) / (GREEN * GREEN)', bn)
    .rename('RI') 
  var CI = image.expression(//Colour index
    '(RED - GREEN) / (RED + GREEN)', bn)
    .rename('CI') 
  var ARVI = image.expression(//Atmospherically Resistant Vegetation Index
    '(NIR - (2 * RED) + BLUE) / (NIR + (2 * RED) + BLUE)', bn)
    .rename('ARVI') 
 
  
 //Add calculated ratios and indices to the image as bands
  var newBands = ee.Image([BSI, NDVI, SCI, SBL, NDBI, NDWI, Br4_3, Br6_2, Br7_3, Br5_4_3, elevation, slope, RI, CI, ARVI, Br5_7]);
  image = image.addBands(newBands);  
  return image;
}

//execute function on image collection
var Process = LS8export.map(process);
//print(Process, 'processed');


var ProcessList = Process.toList(Process.size());
//print(ProcessList, 'ProcessList')

//module exports
exports.LS8export = LS8export
exports.Process = Process
exports.ProcessList = ProcessList
exports.viablegeo = viablegeo
exports.GT = GT
exports.Landsat13 = Landsat13
exports.Landsat17 = Landsat17
exports.Landsat21 = Landsat21
exports.Landsat17Collection = Landsat17Collection
exports.process = process
exports.elevation = elevation
exports.Slope = slope