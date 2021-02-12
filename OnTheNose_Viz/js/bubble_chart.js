class BubbleChart {
    constructor(_parentElement, data) {
        this.parentElement = _parentElement;
        this.data = data;
        this.forceStrength = 0.03;

        this.initVis();
    }

    initVis() {
        let vis = this;

        var notUpdated = true;
        vis.prevLabelSelector='';
        vis.currentLabelSelector='';

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

        vis.recordCoords = {
            'none': {x: vis.width/4, y: 3*vis.height/8},
            'speed record': {x:4*vis.width/8, y: 5*vis.height/8},
            'solo record':{x:4*vis.width/8, y: 3*vis.height/8},
            'four-person team record':{x:6*vis.width/8, y: 5*vis.height/8},
            'male-female record':{x: 6*vis.width/8, y: 3*vis.height/8}
        }

        // maybe consider coding months to 0-6 and just use the same array?? dummy.
        // nvm
        // there there are 8 months. Missed the Marches.
        vis.monthCoords = {
            'March': {x: vis.width/4, y: vis.height/4},
            'May': {x: vis.width/2, y: vis.height/4},
            'June': {x: 3*vis.width/4, y: vis.height/4},
            'July': {x: vis.width/3, y: vis.height/2},
            'August': {x: 2*vis.width/3, y: vis.height/2},
            'September': {x: vis.width/4, y: 3*vis.height/4},
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
        // these no longer matter but I want it KNOWN TO WHOEVER ACTUALLY READS THIS CODE, if that person exists, how much effort I put into placing those years.

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

        // Create Color Scales

        // axis and color scale for the years
        vis.xYears = d3.scaleTime()
            .range([vis.width/8, 7*vis.width/8])
            // .domain([1989, 2015])
            .domain(d3.extent(vis.data, d=>d.Year))

        vis.colorYears = d3.scaleSequential()
            // .domain(1,10)
            .domain(d3.extent(vis.data, d=>d.Year))
            .interpolator(d3.interpolateCool);

        // color scale for the partners
        vis.colorPartners = d3.scaleSequential()
            .domain(d3.extent(vis.data, d=>d.numPartner))
            .interpolator(d3.interpolateGnBu)


        // color scale for the records
        vis.colorRecords = d3.scaleOrdinal()
            .range(["#ffffff","#06d6a0","#1b9aaa","#ef476f","#935fa7","#6f73d2"])
            .domain(['none', 'speed record', 'male-female record', 'four-person team record', 'solo record'])

        vis.colorRecords2 = d3.scaleOrdinal()
            .range(["#fff","#6B40B7","#05b6ff","#24F375","#9EF44B"])
            // .range(["#fff","#6B40B7","#4373E1","#00CCBD","#24F375","#9EF44B"])
            .domain(['none','solo record', 'male-female record', 'speed record','four-person team record'])

        // color scale for the months
        // console.log( vis.colorRecords2('speed record'), vis.colorRecords2('solo record'))
        // wrangle data
        vis.nodes=vis.createNodes()

        // set up force simulation
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
            .force('y', d3.forceY().strength(vis.forceStrength).y(vis.height/2))
            .force('charge', d3.forceManyBody().strength(charge))
            .on('tick', ticked);

        vis.simulation.stop();

        vis.simulation.nodes(vis.nodes);

        // create the initial circles with no grouping
        vis.createBubbles()

        // call pipeline for applying force and rerendering bubbles
        vis.plotMaster("All", notUpdated)
    }
    createNodes() {
        let vis = this;

        let nodes = [];

        vis.data.forEach((d,i)=> {
            nodes.push({
                id: i,
                scaled_radius: vis.radiusScale(d.HoursRounded),
                rounded_time: d.HoursRounded,
                actual_time: d.Time,
                stroke_fill: d.Records==='none'? 'grey' : 'black',
                record_fill: vis.colorRecords2(d.Records),
                color_start: 'white',
                year: d.Year,
                month: d.Month,
                numPartner: d.numPartner,
                partners: d.Partners,
                record: d.Records,
                x: Math.random()*900,
                y: Math.random()*500
            })
        })

        return nodes
    }

    createBubbles(){
        let vis = this;

        vis.svg.selectAll("circle")
            .data(vis.nodes)
            .enter()
            .append("circle")
            .attr("class", "bubble")
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr("r", 0)
            .attr("stroke", d=>d.stroke_fill)
            .attr("stroke-width", d=> d.record == 'none'? 0 : 3)
            .attr("opacity", d=> d.record == 'none'? 0.6  : 1)
            .attr('fill', d=>d.color_start)
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

    plotMaster(selectedGroup, notUpdated){
       let vis = this;

        vis.timeline=false;
        let plottingFunction,labelFunction;
        vis.selectedGroup = selectedGroup;
        vis.colorSelector='color_start'


        if (vis.selectedGroup=="All"){
                // addOverviewFacts()
            plottingFunction = vis.centerBubbles
            labelFunction=vis.centerLabels
            vis.currentLabelSelector='overview'

        } else if (vis.selectedGroup=="Year"){
            plottingFunction = vis.yearBubbles
            labelFunction=vis.yearLabels
            // vis.yearLabels(vis)
            vis.colorSelector='record_fill'
            vis.currentLabelSelector='year'

        } else if (vis.selectedGroup=="Month") {
            plottingFunction = vis.monthBubbles
            labelFunction=vis.monthLabels
            vis.colorSelector = 'record_fill'
            vis.currentLabelSelector='month'

        } else if (vis.selectedGroup=="Partners") {
            plottingFunction = vis.partnerBubbles
            labelFunction=vis.partnerLabels
            vis.colorSelector='record_fill'
            vis.currentLabelSelector='partner'

        } else if (vis.selectedGroup=="Records") {
            plottingFunction = vis.recordBubbles
            labelFunction=vis.recordLabels
            vis.colorSelector='record_fill'
            vis.currentLabelSelector='record'

        } else {
            console.warn("Button does not match acceptable options")
        }


        // the bubbles will update position based on the plottingfunction passed to it
        vis.plotBubbles(plottingFunction)
        vis.updateLabels(vis,vis.prevLabelSelector,labelFunction)


        vis.prevLabelSelector=vis.currentLabelSelector;
        // vis.currentLabelSelector='';


        // the labels will update based on the selected group
        // vis.updateLabels(labelSelector)


        if (notUpdated == true){
            console.log( 'first render')
            // have the pop up about the background displayed. Shouldn't pop up again unless page is refreshed
            // have the overview/facts/how to read pop up - disable with toggle
            // vis.plotAnnotations(vis)
        } else {
            console.log('rerendered')
            // update the bubble color. For some reason, this command only works properly in an if statement.
            // update the labels here??
            vis.updateBubbleColor(vis, vis.colorSelector)
        }

    }

    plotBubbles(coordGenerator) {
        let vis = this;

        vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(d=>coordGenerator(d,vis,'x')));
        vis.simulation.force('y', d3.forceY().strength(vis.forceStrength).y(d=>coordGenerator(d,vis,'y')));

        // @v4 We can reset the alpha value and restart the simulation
        vis.simulation.alpha(1).restart();

    }

    // because the following group of functions are called from a nested function, it is necessary to pass them this.
    updateBubbleColor(vis,colorSelector){
        vis.bubbles
            // .enter()
            .transition()
            .duration(1500)
            .attr('fill', d=>d[colorSelector])
        // .merge(vis.bubbles)


    }

    updateLabels(vis,prevLabelSelector,labelFunction){
        console.log('current label', prevLabelSelector)
        vis.svg.selectAll('.'+prevLabelSelector+'Label').remove();

        labelFunction(vis);
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
         if (coord=='x') {
             return vis.recordCoords[d.record].x
         } else {
             return vis.recordCoords[d.record].y
         }
     }

    partnerBubbles(d,vis, coord){
         if (coord=='x'){
             return vis.partnerCoords[d.numPartner].x
         } else {
             return vis.partnerCoords[d.numPartner].y
         }
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
            return vis.xYears(d.year)
        } else {
            return vis.height/2
        }
    }

    yearLabels(vis){

        console.log('year labels')
        vis.svg.append('g')
            .attr('class', 'yearLabel')
            .attr('id', 'year0Label')
            .attr("transform", "translate("+vis.width/32+","+vis.height/2+")")
            .append('text')
            .attr("transform", "rotate(-90)")
            .style('text-anchor', 'middle')
            .text(1989)

        vis.svg.append('g')
            .attr('class', 'yearLabel')
            .attr('id', 'year1Label')
            // .attr("transform", "translate("+31*vis.width/32+","+vis.height/2+")")
            .append('text')
            .attr("transform", "translate("+31*vis.width/32+","+vis.height/2+") rotate(90)")
            .style('text-anchor', 'middle')
            .text(2015)
    }

    centerLabels(vis){
        console.log( 'overview labels')
    }
    recordLabels(vis) {
        // vis.recordCoords = {
        //     'none': {x: vis.width/4, y: vis.height/2},
        //     'speed record': {x:4*vis.width/8, y: 5*vis.height/8},
        //     'solo record':{x:4*vis.width/8, y: 3*vis.height/8},
        //     'four-person team record':{x: 6*vis.width/8, y: 5*vis.height/8},
        //     'male-female record':{x: 6*vis.width/8, y: 3*vis.height/8}

        // }
        console.log('record labels')
        vis.svg.append('g')
            .attr('class', 'recordLabel')
            .attr("transform", "translate(" + 4 * vis.width / 8 + "," + 13 * vis.height / 16 + ")")
            .append('text')
            .style('text-anchor', 'start')
            .text('Classic')

        vis.svg.append('g')
            .attr('class', 'recordLabel')
            .append('text')
            .attr("transform", "translate(" + 4 * vis.width / 8 + "," + 3 * vis.height / 16 + ")")
            .style('text-anchor', 'start')
            .text('Solo')

        vis.svg.append('g')
            .attr('class', 'recordLabel')
            .append('text')
            .attr("transform", "translate(" + 12 * vis.width / 16 + "," + 3 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('Male-Female')

        vis.svg.append('g')
            .attr('class', 'recordLabel')
            .append('text')
            .attr("transform", "translate(" + 12 * vis.width / 16 + "," + 13 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('4-Person')

        vis.svg.append('g')
            .attr('class', 'recordLabel')
            .append('text')
            .attr("transform", "translate(" +4 * vis.width / 16 + "," + 13 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('None')
    }


    partnerLabels(vis){
        // console.log( 'partner labels')

        vis.svg.append('g')
            .attr('class', 'partnerLabel')
            .attr("transform", "translate(" + 4 * vis.width / 16 + "," + 3.5 * vis.height / 16 + ")")
            .append('text')
            .style('text-anchor', 'start')
            .text('0')

        vis.svg.append('g')
            .attr('class', 'partnerLabel')
            .append('text')
            .attr("transform", "translate(" + 6.25 * vis.width / 16 + "," + 8.5 * vis.height / 16 + ")")
            .style('text-anchor', 'start')
            .text('1')

        vis.svg.append('g')
            .attr('class', 'partnerLabel')
            .append('text')
            .attr("transform", "translate(" + 12.5 * vis.width / 16 + "," + 4 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('2')

        vis.svg.append('g')
            .attr('class', 'partnerLabel')
            .append('text')
            .attr("transform", "translate(" + 1 * vis.width / 16 + "," + 8.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('3')

        vis.svg.append('g')
            .attr('class', 'partnerLabel')
            .append('text')
            .attr("transform", "translate(" +15 * vis.width / 16 + "," + 8.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('4')

        vis.svg.append('g')
            .attr('class', 'partnerLabel')
            .append('text')
            .attr("transform", "translate(" +4 * vis.width / 16 + "," + 13.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('5')

        vis.svg.append('g')
            .attr('class', 'partnerLabel')
            .append('text')
            .attr("transform", "translate(" +12.5 * vis.width / 16 + "," + 13.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('6')
    }

    monthLabels(vis){
        // console.log( 'month labels')

        vis.svg.append('g')
            .attr('class', 'monthLabel')
            .attr("transform", "translate(" +2* vis.width / 16 + "," + 3.5 * vis.height / 16 + ")")
            .append('text')
            .style('text-anchor', 'start')
            .text('MAR')

        vis.svg.append('g')
            .attr('class', 'monthLabel')
            .append('text')
            .attr("transform", "translate(" + 6 * vis.width / 16 + "," + 3.5 * vis.height / 16 + ")")
            .style('text-anchor', 'start')
            .text('MAY')

        vis.svg.append('g')
            .attr('class', 'monthLabel')
            .append('text')
            .attr("transform", "translate(" + 11 * vis.width / 16 + "," + 3.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('JUN')

        vis.svg.append('g')
            .attr('class', 'monthLabel')
            .append('text')
            .attr("transform", "translate(" + 4 * vis.width / 16 + "," + 8.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('JUL')

        vis.svg.append('g')
            .attr('class', 'monthLabel')
            .append('text')
            .attr("transform", "translate(" +9.5 * vis.width / 16 + "," + 8.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('AUG')

        vis.svg.append('g')
            .attr('class', 'monthLabel')
            .append('text')
            .attr("transform", "translate(" +2* vis.width / 16 + "," + 13 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('SEP')

        vis.svg.append('g')
            .attr('class', 'monthLabel')
            .append('text')
            .attr("transform", "translate(" +6.5 * vis.width / 16 + "," + 13.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('OCT')

        vis.svg.append('g')
            .attr('class', 'monthLabel')
            .append('text')
            .attr("transform", "translate(" +11.5 * vis.width / 16 + "," + 13.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('NOV')
    }
}

