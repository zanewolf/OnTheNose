class BubbleChart {


    constructor(_parentElement, data) {
        this.parentElement = _parentElement;
        // this.legendElement = _legendElement;
        this.data = data;
        this.forceStrength = 0.03;
        //this.practiceData = practiceData;
        // console.log(this.data)

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        //set up svg area
        vis.margin = {top: 10, right: 10, bottom: 0, left: 0};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;


        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            // .attr('transform', `translate (${vis.width / 2}, ${vis.height / 2})`);
        // commented transform out because it was throwing off all the position calculations

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

        vis.yearCoords = {
            '1989' : {x: vis.width/8, y: 3*vis.height/16},
            '1990' : {x: vis.width/8, y: 5*vis.height/16},
            '1991' : {x: vis.width/8, y: vis.height/2},
            '1992' : {x: vis.width/8, y: 3*vis.height/4},
            '1993' : {x: 3*vis.width/16, y: 7*vis.height/8},
            '1994' : {x: 9*vis.width/32, y: 3*vis.height/4},
            '1995' : {x:  9*vis.width/32, y: vis.height/2},
            '1996' : {x:  9*vis.width/32, y: 3*vis.height/8},
            '1997' : {x: 21*vis.width/64, y: 3*vis.height/16},
            '1998' : {x: 3*vis.width/8, y: 5*vis.height/16},
            '1999' : {x: 3*vis.width/8, y: vis.height/2},
            '2000' : {x: 3*vis.width/8, y: 11*vis.height/16},
            '2001' : {x: 15*vis.width/32, y: 13*vis.height/16},
            '2002' : {x: vis.width/2, y: 5*vis.height/8},
            '2003' : {x: vis.width/2, y: 3*vis.height/8},
            '2004' : {x: vis.width/2, y: 3*vis.height/16},
            '2005' : {x: 9*vis.width/16, y: vis.height/8},
            '2006' : {x: 5*vis.width/8, y: vis.height/4},
            '2007' : {x: 5*vis.width/8, y:7*vis.height/16},
            '2008' : {x: 5*vis.width/8, y: 5*vis.height/8},
            '2009' : {x: 5*vis.width/8, y: 27*vis.height/32},
            '2010' : {x: 23*vis.width/32, y: 7*vis.height/8},
            '2011' : {x: 25*vis.width/32, y: 3*vis.height/4},
            '2012' : {x: 25*vis.width/32, y: vis.height/2},
            '2013' : {x: 25*vis.width/32, y: 5*vis.height/16},
            '2014' : {x: 27*vis.width/32, y: vis.height/4},
            '2015' : {x: 29*vis.width/32, y: 3*vis.height/8}
        }





        // init tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'tooltip');



        // set up scale for radius
        vis.radiusScale = d3.scalePow()
            .exponent(0.5)
            .range([0.5,30])
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

        // let myvar= "Alll";

        // vis.plotBubbles(vis.centerBubbles);

        vis.plotMaster("All")
    }

    createCircles(){
        let vis = this;

        console.log(vis.nodes)

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
        let plottingFunction;
        vis.selectedGroup = selectedGroup;

        if (vis.selectedGroup=="All"){
                // centerBubbles()
                // addOverviewFacts()
                plottingFunction = vis.centerBubbles

            } else if (vis.selectedGroup=="Year"){
                // splitbyYear()
                plottingFunction = vis.yearBubbles

            } else if (vis.selectedGroup=="Month") {
                // splitbyMonth()
                plottingFunction = vis.monthBubbles

            } else if (vis.selectedGroup=="Partners") {
                // splitbyParnter()
                plottingFunction = vis.partnerBubbles

            } else if (vis.selectedGroup=="Records") {
                // splitbyRecord()
                plottingFunction = vis.recordBubbles

            } else {
                console.warn("Button does not match acceptable options")
            }

        vis.plotBubbles(plottingFunction)

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
        console.log(d.month)
         if (coord=='x'){
             return vis.monthCoords[d.month].x
         } else {
             return vis.monthCoords[d.month].y
         }
     }

     yearBubbles(d,vis, coord){
        console.log(d.year)
         if (coord=='x'){
             return vis.yearCoords[d.year].x
         } else {
             return vis.yearCoords[d.year].y
         }

     }

     splitByPartner(d,vis){

     }
     splitByMonth(d,vis){

     }

    updateVis(){
        let vis = this;

        // vis.createBubbles()
        // vis.addForceLayout()

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

        // console.log(nodes)
    }

    splitbyPartner(d){
        console.log("here")
    }

}

