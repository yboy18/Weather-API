
/*
 * API.
 */
// defind library
var dateFormat = require('dateformat');
var sync = require('sync-request'); 
var mongoose = require("mongoose");

// define mongodb connection to mLab
mongoose.connect('mongodb://Ak47api:Ak47api569@ds161295.mlab.com:61295/nodejs-api', function(err){
    if (err) {
        console.log('mongodb connection error', err);
    } else {
        console.log('mongodb connection successful');
    }
});

var searchSchema = new mongoose.Schema({
    value: String,  //Search value
    json: Object,  //API content
    sdate: { type: Date, default: Date.now } //Search Date
});

//define mongo db collection
var Todo = mongoose.model('apis', searchSchema);

exports.search = function(req, res){
    
    var today = new Date();
    try {
        // no search value handler
        if(req.query.v == null || req.query.v == ''){
            var data = { 'code':'400', 'message': 'Bad Request.'};
            res.header('Contect-type', 'application/json');
            res.header('Charset', 'utf8');
            res.jsonp(data);
        }else{
            Todo.find({value:req.query.v, sdate: dateFormat(today, 'yyyy-mm-dd')+'T00:00:00.000Z'}, function(err, result){
                
                if(result == ''){
                    // Data feed url
                    var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?units=metric&cnt=5&APPID=2f631286868287f261e78e0a9c214411&q='+req.query.v;
                    var htmlcontent = sync('GET', url);
                    var data = JSON.parse(htmlcontent.getBody().toString('utf8'));
                    
                    // City not found handler
                    if(data.cod == '404'){
                        var data2 = { 'code':'404','source': 'api.openweathermap.org', 'message': 'Not found city.'};
                        res.header('Contect-type', 'application/json');
                        res.header('Charset', 'utf8');
                        res.jsonp(data2);
                    }else{
                        Todo.create({
                               value: req.query.v,
                               json: data,
                               sdate: dateFormat(today, 'yyyy-mm-dd')
                            }, function(err,todo){
                                if(err) {
                                    console.log( err);
                                }else{
                                    //Print Result from  open weather map
                                    data['code'] = '200';
                                    data['source'] = 'api.openweathermap.org';
                                    res.header('Contect-type', 'application/json');
                                    res.header('Charset', 'utf8');
                                    res.jsonp(data);
                                
                            };
                        });
                    }
                }else{
                    //Print Result from mongo DB
                    result[0].json['code'] = '200';
                    result[0].json['source'] = 'mLab-MongoDB';
                    res.header('Contect-type', 'application/json');
                    res.header('Charset', 'utf8');
                    res.jsonp(result[0].json);
                    
                }
            });
        }
    }catch (ex) {
        // try catch exception handler
        var data = { 'code':'500', 'message': ex.message};
        res.header('Contect-type', 'application/json');
        res.header('Charset', 'utf8');
        res.jsonp(data);
    }
    
};