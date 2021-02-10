class BubbleChart {
    constructor(_parentElement, data) {
        this.parentElement = _parentElement;
        this.data = data;
        this.forceStrength = 0.03;

        this.initVis();
    }

    initVis() {
        let vis = this;

        //set up svg area
        vis.margin = {top: 20, right: 10, bottom: 0, left: 0};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;


        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            // .attr('transform', `translate (${vis.width / 2}, ${vis.height / 2})`);
        // commented transform out because it was throwing off all the position calculations



        // create the coordinate for the various arrangements. Be warned, this became quite tedious.

        // need to create array positions for years, months, and partners. WITHOUT MAGIC NUMBERS
        // partners will need 7. 0-6.
        // hey, 7 months (May - Nov). Use the same coordinates
        vis.partnerCoords = {
            0: {x: vis.width/3, y: vis.height/4},
            1: {x: vis.width/2, y: vis.height/2},
            2: {x: 2*vis.width/3, y: vis.height/4},
            3: {x: vis.width/6, y: vis.height/2},
            4: {x: 5*vis.width/6, y: vis.height/2},
            5: {x: vis.width/3, y: 3*vis.height/4},
            6: {x: 2*vis.width/3, y: 3*vis.height/4},
        }

        // maybe consider coding months to 0-6 and just use the same array?? dummy.
        // nvm
        // there there are 8 months. Missed the Marches.
        vis.monthCoords = {
            'March': {x: vis.width/4, y: vis.height/4},
            'May': {x: vis.width/2, y: vis.height/4},
            'June': {x: vis.width/3, y: vis.height/2},
            'July': {x: 3*vis.width/4, y: vis.height/4},
            'August': {x: vis.width/4, y: 3*vis.height/4},
            'September': {x: 2*vis.width/3, y: vis.height/2},
            'October': {x: vis.width/2, y: 3*vis.height/4},
            'November': {x: 3*vis.width/4, y: 3*vis.height/4}

        }

        // want to display them on a 'winding timeline', with accompanying timeline made using a cubic bezier curve command. This is gonna get....tedious. Yes, I drew it out and hand-plotted things down to the 64ths. It all had to fit.
        vis.yearCoords = {
            '1989' : {x: 8*vis.width/64, y: 12*vis.height/64},
            '1990' : {x: 8*vis.width/64, y: 20*vis.height/64},
            '1991' : {x: 8*vis.width/64, y: 32*vis.height/64},
            '1992' : {x: 8*vis.width/64, y: 44*vis.height/64},
            '1993' : {x: 12*vis.width/64, y: 56*vis.height/64},
            '1994' : {x: 16*vis.width/64, y: 48*vis.height/64},
            '1995' : {x: 16*vis.width/64, y: 36*vis.height/64},
            '1996' : {x: 16*vis.width/64, y: 24*vis.height/64},
            '1997' : {x: 20*vis.width/64, y: 12*vis.height/64},
            '1998' : {x: 24*vis.width/64, y: 20*vis.height/64},
            '1999' : {x: 24*vis.width/64, y: 32*vis.height/64},
            '2000' : {x: 24*vis.width/64, y: 44*vis.height/64},
            '2001' : {x: 28*vis.width/64, y: 56*vis.height/64},
            '2002' : {x: 32*vis.width/64, y: 45*vis.height/64},
            '2003' : {x: 32*vis.width/64, y: 30*vis.height/64},
            '2004' : {x: 32*vis.width/64, y: 20*vis.height/64},
            '2005' : {x: 36*vis.width/64, y: 12*vis.height/64},
            '2006' : {x: 40*vis.width/64, y: 24*vis.height/64},
            '2007' : {x: 40*vis.width/64, y: 32*vis.height/64},
            '2008' : {x: 40*vis.width/64, y: 43*vis.height/64},
            '2009' : {x: 44*vis.width/64, y: 56*vis.height/64},
            '2010' : {x: 48*vis.width/64, y: 48*vis.height/64},
            '2011' : {x: 48*vis.width/64, y: 36*vis.height/64},
            '2012' : {x: 48*vis.width/64, y: 24*vis.height/64},
            '2013' : {x: 52*vis.width/64, y: 12*vis.height/64},
            '2014' : {x: 56*vis.width/64, y: 20*vis.height/64},
            '2015' : {x: 56*vis.width/64, y: 32*vis.height/64}
        }

        // vis.timeScale = d3.scaleTime()
        //     .range(vis.width/8, 7/8*vis.width)
        //     .domain()

        vis.x = d3.scaleLinear().range([vis.width/8, 7/8*vis.width])

        vis.xTimeAxis = d3.axisBottom()
            .scale(vis.x)
            .tickFormat(d3.timeFormat("%Y"))

        // going to start this off trying to draw only four bits of the curve, from peak to peak.
        // vis.timelineCoords = {
        //     0 : {x: 8*vis.width/64, y: 12*vis.height/64}, //89
        //     1 : {x: 21*vis.width/64, y: 12*vis.height/64}, //97
        //     2 : {x: 34*vis.width/64, y: 3*vis.height/64}, //05- a bit to the left
        //     3 : {x: 54*vis.width/64, y: 12*vis.height/64}, //13
        //     4:  {x: 58*vis.width/64, y: 40*vis.height/64} //stopping point just beyond 2015.
        // }

        // init tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'tooltip');

        // set up scale for radius
        vis.radiusScale = d3.scalePow()
            .exponent(0.5)
            .range([1,32])
            .domain([0, d3.max(vis.data, d=>d.HoursRounded)])

        // wrangle the data into the node format
        vis.nodes=vis.createNodes()

        // create the initial circles with no grouping
        vis.createCircles()

        function charge(d) {
            return -Math.pow(d.scaled_radius, 2.0) * vis.forceStrength;
        }

        function ticked() {
            // console.log(vis.alpha())
            vis.bubbles
                .attr('cx', function (d) { return d.x; })
                .attr('cy', function (d) { return d.y; });
        }

        vis.simulation = d3.forceSimulation()
            .velocityDecay(0.2)
            .force('x', d3.forceX().strength(vis.forceStrength).x(vis.width/2))
            .force('y', d3.forceY().strength(vis.forceStrength).y(vis.height/1.8))
            .force('charge', d3.forceManyBody().strength(charge))
            .on('tick', ticked);
        vis.simulation.stop();
        //
        vis.simulation.nodes(vis.nodes);

        vis.plotMaster("All")
    }

    createCircles(){
        let vis = this;

        // console.log(vis.nodes)

        vis.svg.selectAll("circle")
            .data(vis.nodes)
            .enter()
            .append("circle")
            .attr("class", "bubble")
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr("r", 0)
            .attr("stroke", "black")
            .attr("opacity", 1)
            .attr("fill", d=>d.color_fill)
            .on("mouseover", (event,d)=>{
                // console.log(d)
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX+10 + "px")
                    .style("top", event.pageY+10 + "px")
                    .attr('id', 'tooltip')
                    .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
                         <p> <strong>Total Time: </strong>${d.actual_time}</p>
                         <p> <strong> Partners: </strong> ${d.partners}</p>
                         <p> <strong> Year </strong> ${d.year}</p>

                     </div>`)
            })
            .on("mouseout", (event,d)=>{
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

        vis.bubbles = d3.selectAll('.bubble');

        // Fancy transition to make bubbles appear, ending with the correct radius
        vis.bubbles.transition()
            .duration(1000)
            .attr('r', d=> d.scaled_radius);


    }

    plotMaster(selectedGroup){
        let vis = this;

        vis.timeline=false;
        let plottingFunction;
        vis.selectedGroup = selectedGroup;

        if (vis.selectedGroup=="All"){
                // addOverviewFacts()
                plottingFunction = vis.centerBubbles

            } else if (vis.selectedGroup=="Year"){

                plottingFunction = vis.yearBubbles
                vis.timeline = true;
                // vis.plotTimeline(vis)

            } else if (vis.selectedGroup=="Month") {

                plottingFunction = vis.monthBubbles

            } else if (vis.selectedGroup=="Partners") {

                plottingFunction = vis.partnerBubbles

            } else if (vis.selectedGroup=="Records") {

                plottingFunction = vis.recordBubbles

            } else {
                console.warn("Button does not match acceptable options")
            }

        vis.plotBubbles(plottingFunction)

        if (vis.timeline == true){
            vis.plotTimeline(vis)
        } else {
            vis.svg.selectAll('.timeline').remove()
            // vis.timelinePlot.exit().remove()
        }

    }

    plotBubbles(coordGenerator) {
        // only called if buttons are clicked, otherwise x,y are assigned default random values
        let vis = this;

        vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(d=>coordGenerator(d,vis,'x')));
        vis.simulation.force('y', d3.forceY().strength(vis.forceStrength).y(d=>coordGenerator(d,vis,'y')));

        // if (vis.selectedGroup === "All") {
        //     vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(vis.width / 2));
        // } else if (vis.selectedGroup==="Records"){
        //     vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x( d=> d.record === 'none'? vis.width / 4 : vis.width*3/4));
        //
        // } else {
        //     vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(coordGenerator))
        // }

        // @v4 We can reset the alpha value and restart the simulation
        vis.simulation.alpha(1).restart();


        // vis.updateVis()
    }

    centerBubbles(d,vis, coord){
        // console.log('centerbubbles',d)
        // return (900/2);
         if (coord=='x'){
             return (vis.width/2)
         } else {
             return (vis.height/2)
         }
       // return (vis.width/2);
     }
    recordBubbles(d, vis, coord){
        // console.log('splitbyRecords',d)
         if (coord=='x') {
             return (d.record === 'none' ? vis.width / 4 : vis.width * 3 / 4);
         } else {
             return vis.height/2;
         }
     }
    partnerBubbles(d,vis, coord){

         if (coord=='x'){
             return vis.partnerCoords[d.numPartner].x
         } else {
             return vis.partnerCoords[d.numPartner].y
         }
         // return (v
        // return vis.partnerCoords[d.numPartner].x
     }
    monthBubbles(d,vis, coord){
        // console.log(d.month)
         if (coord=='x'){
             return vis.monthCoords[d.month].x
         } else {
             return vis.monthCoords[d.month].y
         }
     }
    yearBubbles(d,vis, coord){
         if (coord=='x'){
             return vis.yearCoords[d.year].x
         } else {
             return vis.yearCoords[d.year].y
         }
    }

    yearBubbles2(d,vis,coord){
        if (coord=='x'){
            return vis.x[d]
        } else {
            return vis.height/2
        }

    }

    plotTimeline(vis){
        console.log('timeline')
        vis.svg.append('g')
            .attr("class", "x.axis")
            .attr("transform", "translate(0,"+vis.height/2.1+")")
            .call(vis.xTimeAxis.ticks(null).tickSize(0))

        // set up timeline group
        // vis.timelinePlot = vis.svg
        //     .append('g')
        //     .attr('class', 'timeline')
        //     .attr('id', 'yearTimeline')

            // .attr('transform', `translate (${vis.width / 2}, ${vis.height / 2})`);

        // // Creating a path
        // vis.timelinePlots = vis.timelinePlot
        //     .attr('class', 'lineSections')
        //
        // vis.timelineCoords = {
        //     0 : {x: 8*vis.width/64, y: 12*vis.height/64}, //89
        //     1 : {x: 21*vis.width/64, y: 12*vis.height/64}, //97
        //     2 : {x: 34*vis.width/64, y: 3*vis.height/64}, //05- a bit to the left
        //     3 : {x: 54*vis.width/64, y: 12*vis.height/64}, //13
        //     4:  {x: 58*vis.width/64, y: 40*vis.height/64} //stopping point just beyond 2015.
        // }
        // vis.timelinePlot
            // .datum(vis.timelineCoords)
            // .append('path')
            // .attr('class', 'timelineLine')
            // .attr('stroke', 'black')
            // .attr('fill', 'none')
            // .attr('d', function(d,i){
            //     console.log('line generator')
                // console.log(vis.width/8, d[i].x)

                // 1: 8/64*vis.width, 12/64*vis.height
                //c1: 8/64*vis.width, 56/64*vis.height
                // 2: (21-12)/2/64*vis.width, ((56-12)/2/64+12/64)*vis.height
                //c2: (21-12)/2/64*vis.width, 56/64*vis.height
                // 3: (30-21)/2/64*vis.width, ((56-12)/2/64+12/64)*vis.height
                //c3: (30-21)/2/64*vis.width, 12/64*vis.height
                // 4: (36-30)/2/64*vis.width, ((56-12)/2/64+12/64)*vis.height
                //c4: (36-30)/2/64*vis.width, 12/64*vis.height
                // 5: (44-36)/2/64*vis.width, ((56-12)/2/64+12/64)*vis.height
                //c5: (44-36)/2/64*vis.width, 56/64*vis.height
                // 6: (52-44)/2/64*vis.width, ((56-12)/2/64+12/64)*vis.height
                //c6: (52-44)/2/64*vis.width, 56/64*vis.height
                // 7: 56/64*vis.width, 32/64*vis.height
                //c7: 56/64*vis.width, 12/64*vis.height

                // return "M " + d[i].x + " " + d[i].y + " V -" + vis.height
                // return "M 10,50 Q 25,25 40,50 t 30,0 30,0 30,0 30,0, 30,0 "
                // return "M 0"+","+12/64*vis.height+ " Q 25,25 "+ vis.width+","+vis.height/2 //+" t 30,0 30,0 30,0 30,0, 30,0 "
                // M [X1 Y1] C [CX1 CY1] [CX2 CY2] [X2 Y2] S [X3 Y3] [CX3 CY3] S [X4 Y4] [CX4 CY4] S ....
                // return "M " + 8/64*vis.width + " " + 12/64*vis.height + " C " + 8/64*vis.width + " " + 54/64*vis.height+ " " + (21-12)/2/64*vis.width + " " + 56/64*vis.height + " " + (21-12)/2/64*vis.width + " " + ((56-12)/2/64+12/64)*vis.height + " S " + (30-21)/2/64*vis.width + " " + ((56-12)/2/64+12/64)*vis.height + " " + (30-21)/2/64*vis.width + " " +  12/64*vis.height + " S " + (36-30)/2/64*vis.width + " " + ((56-12)/2/64+12/64)*vis.height + " " + (36-30)/2/64*vis.width + " " + 12/64*vis.height
                // return "M 50 50 C 50 700 300 700 300 250 S 400 50 400 500 S 500 50 500 100 S 600 150 600 0"
                // return "M " + 6*vis.width/64 + " " + 10*vis.height/64 + " C 100 750 400 750 " + 19*vis.width/64 + " " + 10*vis.height/64
            })

        console.log(vis.timelinePlot)
    }



    createNodes() {
         let vis = this;

         let nodes = []
         vis.data.forEach((d,i)=> {
             // console.log(d)
             nodes.push({
                 id: i,
                 scaled_radius: vis.radiusScale(d.HoursRounded),
                 rounded_time: d.HoursRounded,
                 actual_time: d.Time,
                 color_fill: d.Record===''? 'white' : 'black',
                 year: d.Year,
                 month: d.Month,
                 numPartner: d.numPartner,
                 partners: d.Partners,
                 record: d.Record===''? 'none' : d.Record,
                 x: Math.random()*900,
                 y: Math.random()*500
             })
         })

        return nodes
    }
}

