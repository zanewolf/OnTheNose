let bubbleVis, clusterVis;

let timeParser = d3.timeParse("%m/%Y")
let timeParser2= d3.timeParse("%m/%d/%Y")
let timeFormatter = d3.timeFormat("%m/%d/%Y")
let monthFormatter = d3.timeFormat("%B")
let yearFormatter = d3.timeFormat("%Y")

let promises = [
    d3.csv("data/onthenoseData.csv"),
    d3.csv("data/data.csv")
]
Promise.all(promises)
    .then( function(data){
        // console.log(data[0]);

        data[0].forEach(d=>{
            // console.log(d)
            //     console.log(d["Date-Full"])

                // convert d.Date to actual date object first
                if (d["Date-Full"]===""){
                    d.DateObject = timeParser(d.Date)
                } else {
                    d.DateObject = timeParser2(d["Date-Full"])
                }
                d.DateFormatted= timeFormatter(d.DateObject)
                d.Month=monthFormatter(d.DateObject)
                d.Year=yearFormatter(d.DateObject)

                let res = d.Time.split(":")
                d.HoursRounded = parseFloat((Math.round((parseFloat(res[0])*3600+parseFloat(res[1])*60+parseFloat(res[2]))/3600*10)/10).toFixed(1));
                // console.log(d)

        })

        // need to convert the Time column into something more meaningful than a string

        // console.log(data)
        createVis(data)

    })
    // .catch(function(err){console.log("error, ya goofball")})

function createVis(data){
    // bubbleVis = new BubbleVis("bubble-vis", data)
    clusterVis = new BubbleChart("bubble-vis", data[0])
}

function updateSelectedGroup(){
    // console.log(data2[$('#rs-range-line').val()])
    clusterVis.wrangleData(data2[$('#rs-range-line').val()])

}