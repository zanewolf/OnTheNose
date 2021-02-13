let bubbleVis, clusterVis;

let timeParser = d3.timeParse("%m/%d/%Y")
let timeParser2= d3.timeParse("%m/%d/%Y")
let timeFormatter = d3.timeFormat("%m/%d/%Y")
let monthFormatter = d3.timeFormat("%B")
let yearFormatter = d3.timeFormat("%Y")
var notUpdated = true;
var labelToggle=true;

let promises = [
    d3.csv("data/onthenoseData.csv"),
    d3.csv("data/data.csv")
]
Promise.all(promises)
    .then( function(data){

        data[0].forEach(d=>{
                // convert d.Date to actual date object first
                if (d["Date-Full"]===""){
                    d.DateObject = timeParser(d.Date)
                } else {
                    d.DateObject = timeParser2(d["Date-Full"])
                }
                d.DateFormatted= timeFormatter(d.DateObject)
                d.Month=monthFormatter(d.DateObject)
                d.Year=yearFormatter(d.DateObject)
                d.numPartner = d['Num. Partners']
                d.Partners=[d['Partner 1'], d['Partner 2'],d['Partner 3'],d['Partner 4'],d['Partner 5'],d['Partner 6']].filter(Boolean).join(", ")
                // console.log(d)
                d.Records = d.Record ==''? 'none': d.Record
                let res = d.Time.split(":")
                d.HoursRounded = parseFloat((Math.round((parseFloat(res[0])*3600+parseFloat(res[1])*60+parseFloat(res[2]))/3600*10)/10).toFixed(1));
                // console.log(d)

        })

        // console.log(d3.Year))

        // need to convert the Time column into something more meaningful than a string

        // console.log(data)
        createVis(data)

    })
    // .catch(function(err){console.log("error, ya goofball")})

function createVis(data){
    // bubbleVis = new BubbleVis("bubble-vis", data)
    clusterVis = new BubbleChart("bubble-vis", data[0])
}

function updateSelectedGroup(buttonVal){
    // console.log('updated', buttonVal)
    var notUpdated = false;
    // clusterVis.plotMaster(data2[$('#rs-range-line').val()], notUpdated)
    clusterVis.plotMaster(buttonVal.toString(), notUpdated)

}

// function toggleLabel(){
//     // console.log('toggle', $('#labelToggle').val())
//     $('.label').toggle()
//     // if ($('#labelToggle').val()=='on'){
//     //     $('#labelToggle').val('off')
//     // } else{
//     //     $('#labelToggle').val('on')
//     // }
// }