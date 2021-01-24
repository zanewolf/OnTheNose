let bubbleVis;

 let timeParser = d3.timeFormat("")
let monthParser = d3.timeParse("%B")
let yearParser = d3.timeParse("%Y")

let promises = [
    d3.csv("data/onthenoseData.csv")
]
Promise.all(promises)
    .then( d=>{
        // console.log(d);

        d.forEach(d=>{
            d.forEach(d=> {
                console.log(d.Date)
                d[Month]=monthParser(d.Date)
                d[Year]=yearParser(d.Date)
        //        let res = d.Time.split(":")
                console.log(d)
        //
        //         let time = parseFloat(res[0])*3600+parseFloat(res[1])*60+parseFloat(res[2])
        //         console.log(time)
        //
        //         let time2 = time/3600;
        //        console.log(time2)
        //         // d[Time2]=+ timeParser(d.Time);
            })
        })

        // need to convert the Time column into something more meaningful than a string

        console.log(d)

    })
    .catch(function(err){console.log("error reading in data")})