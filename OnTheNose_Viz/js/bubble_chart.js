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
        vis.prevLabelSelectors=[];
        vis.prevLabel='';
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
            .range([1,vis.width/50])
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
                partners: d.Partners == ''? "None" : d.Partners,
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
                d3.select(event.currentTarget)
                    .attr('stroke','red')
                    .attr('stroke-width', 3)
                    // white fill works for some of the color legends but not for success or launches, where white is informational. Changed it to green, which is not used in either of those scales.
                // console.log(d)
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX+10 + "px")
                    .style("top", event.pageY+10 + "px")
                    .attr('id', 'tooltip')
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: white; padding: 20px">
                            <p> <strong> Year: </strong> ${d.year}</p>
                            <p> <strong>Total Time: </strong>${d.actual_time}</p>
                            <p> <strong> Partners: </strong> ${d.partners}</p>
                            <p> <strong> Record: </strong> ${d.record}
                         </div>
                    `)
            })
            .on("mouseout", (event,d)=>{
                d3.select(event.currentTarget)
                    .attr('stroke', d=>d.stroke_fill)
                    .attr("stroke-width", d=> d.record == 'none'? 0 : 3)
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
            vis.currentLabelSelector='center'

        } else if (vis.selectedGroup=="Year"){
            plottingFunction = vis.yearBubbles
            labelFunction=vis.yearLabels
            // it make look redundant to have all the record_fills, but I initially started off which each selection having it's own color scheme/scale and decided that it was too much
            // and then was too lazy to rewrite the code and remove the redundancy. Go me.
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
            // ya know....jut in case.
            console.warn("Button does not match acceptable options")
        }

        // the bubbles will update position based on the plottingfunction passed to it
        vis.plotBubbles(plottingFunction)

        // Okay, so, this next bit of code looks unweildy but was designed to increase efficiency.
        // if fact, you might be asking, why have vis.prevLabelSelectors, vis.prevLabel, AND vis.currentLabelSelector. Bare with me.
        // Problem: the original version of updateLabels just took two inputs (not including vis):
        // previous label and label function. With these, it deleted the previous labels and called the label function to create new labels.
        // you can probably already see how this is wasteful. Create new labels, delete old ones, create new labels, delete old ones, and so on. At some point, you're going to be remaking labels the code has already made.
        // to solve this, I decided to create a cache, vis.prevLabelSelectors
        // if the labels have never been called before, then add add the current selector to this array. However, if they HAVE been made before, don't. It won't serve to have an ever-growing array
        // Now, I want to call the updateLabel function with the list of labels that have already been made, excluding the current one (prevLabelSelectors), I want to know exactly which label is currently on the screen so I can deactivate just that one (prevLabel), and I want to know which label I'm both being asked to make (currentLabelSelector) and which function I need to use to make it (labelFunction) so that if currentLabelSelector IS in prevLabelSelectors, then I know which one to toggle.
        vis.updateLabels(vis,vis.prevLabelSelectors, vis.prevLabel, vis.currentLabelSelector,labelFunction)


        // add the current label to the prevLabelSelectors if it's not already there
        if (vis.prevLabelSelectors.includes(vis.currentLabelSelector)==false){
            vis.prevLabelSelectors.push(vis.currentLabelSelector)
        }

        // and update the previouslabel value
        vis.prevLabel=vis.currentLabelSelector;


        // update color of the bubbles. for SOME REASON, if this call is outside of an if statement, the rendering looks fucked up. Try it if you don't believe me. I have no clue why.
        if (notUpdated !== true){
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

    // because the following group of functions are called from a nested function, it is necessary to pass them 'this'. Apparently. TIL.
    updateBubbleColor(vis,colorSelector){
        vis.bubbles
            // .enter()
            .transition()
            .duration(1500)
            .attr('fill', d=>d[colorSelector])
        // .merge(vis.bubbles)


    }

    updateLabels(vis,prevLabelSelectors,prevLabel,currentLabelSelector,labelFunction){

        //if the current label HAS been made before, toggle both the label currently on the screen (prevLabel) to deactivate it and the current label to activate it.
        if (prevLabelSelectors.includes(currentLabelSelector)){
            $('.'+currentLabelSelector+'Label').toggle()
            $('.'+prevLabel+'Label').toggle()
        } else{
            // if the current label has NOT been made, make it and toggle the prevLabel
            $('.'+prevLabel+'Label').toggle()
            labelFunction(vis);
        }

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

        // console.log('year labels')
        vis.svg.append('g')
            .attr('class', 'yearLabel label')
            .attr('id', 'year0Label')
            .attr("transform", "translate("+vis.width/32+","+vis.height/2+")")
            .append('text')
            .attr("transform", "rotate(-90)")
            .style('text-anchor', 'middle')
            .text(1989)

        vis.svg.append('g')
            .attr('class', 'yearLabel label')
            .attr('id', 'year1Label')
            // .attr("transform", "translate("+31*vis.width/32+","+vis.height/2+")")
            .append('text')
            .attr("transform", "translate("+31*vis.width/32+","+vis.height/2+") rotate(90)")
            .style('text-anchor', 'middle')
            .text(2015)
    }

    centerLabels(vis){
        // console.log( 'overview labels')
        // vis.svg.append('g')
        //     .attr('class', 'centerLabel label')
        //     .attr("transform", "translate(" +3* vis.width / 16 + "," + 1* vis.height / 16 + ")")
        //     .append('text')
        //     .style('text-anchor', 'middle')
        //     .text('Overview')

        vis.svg.append('g')
            .attr('class', 'centerLabel label aboutLabel')
            .attr("transform", "translate(" +2.5* vis.width / 16 + "," + 9* vis.height / 16 + ")")
            .append('text')
            .style('font-size', '12pt')
            .style('text-anchor', 'middle')
            .text("For the last three decades, Hans Florine has climbed the same 3000+ foot (900m) climb over 100 times. And he got really quick at it. He was not the first to climb the Nose, this historic climb up El Capitan in Yosemite, in under a day, but he was the first to do so in under 10 hours. And then 6...4...3...2 and a half. Hans reset the 'Classic' two-man team speed record 8 times, in addition to a few other speed records. These are his 101 climbs on the Nose.")
            .call(vis.wrap, vis.width/4)

            // .html(`
            //          <div style="border: thin solid grey; border-radius: 5px; background: darkgray; padding: 20px">
            //              <p> <strong>Total Time: </strong></p>
            //
            //          </div>`)

        // vis.circleCoords = {
        //     0: {x:2*vis.width/16, y: 10*vis.height/16, r:35 },
        //     1: {x:4*vis.width/16, y: 10*vis.height/16, r:27 }
        // }

        // console.log( vis.circleCoords[1].x)

        vis.svg.append('g')
            .attr('class', 'centerLabel label')
            // .attr("transform", "translate(" +3* vis.width / 16 + "," + 1* vis.height / 16 + ")")
            .append('circle')
            .attr('cx',12*vis.width/16)
            .attr('cy',  7*vis.height/16)
            .attr('r', vis.radiusScale(96))
            .attr('stroke', 'white')
            .attr('fill', 'none')
            .attr('opacity', '1')
        //
        // vis.svg.append('g')
        //     .attr('class', 'centerLabel label')
        //     // .attr("transform", "translate(" +3* vis.width / 16 + "," + 1* vis.height / 16 + ")")
        //     .append('circle')
        //     .attr('cx',1.5*vis.width/16)
        //     .attr('cy',  10*vis.height/16)
        //     .attr('r', vis.radiusScale(72))
        //     .attr('stroke', 'white')
        //     .attr('fill', 'none')
        //     .attr('opacity', '0.9')

        vis.svg.append('g')
            .attr('class', 'centerLabel label')
            // .attr("transform", "translate(" +3* vis.width / 16 + "," + 1* vis.height / 16 + ")")
            .append('circle')
            .attr('cx',12*vis.width/16)
            .attr('cy',  7*vis.height/16)
            .attr('r', vis.radiusScale(48))
            .attr('stroke', 'white')
            .attr('fill', 'none')
            .attr('opacity', '0.8')

        vis.svg.append('g')
            .attr('class', 'centerLabel label')
            // .attr("transform", "translate(" +3* vis.width / 16 + "," + 1* vis.height / 16 + ")")
            .append('circle')
            .attr('cx',12*vis.width/16)
            .attr('cy',  7*vis.height/16)
            .attr('r', vis.radiusScale(24))
            .attr('stroke', 'white')
            .attr('fill', 'none')
            .attr('opacity', '0.7')

        vis.svg.append('g')
            .attr('class', 'centerLabel label')
            // .attr("transform", "translate(" +3* vis.width / 16 + "," + 1* vis.height / 16 + ")")
            .append('circle')
            .attr('cx',12*vis.width/16)
            .attr('cy',  7*vis.height/16)
            .attr('r', vis.radiusScale(3))
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('opacity', '0.6')

        vis.svg.append('g')
            .attr('class', 'centerLabel label legend')
            .attr("transform", "translate(" +12.5* vis.width / 16 + "," + 7* vis.height / 16 + ")")
            .append('text')
            .text("Duration (Hours) of each Climb")
            .call(vis.wrap, vis.width/6)

        vis.svg.append('g')
            .attr('class', 'centerLabel label')
            // .attr("transform", "translate(" +3* vis.width / 16 + "," + 1* vis.height / 16 + ")")
            .append('circle')
            .attr('cx',12*vis.width/16)
            .attr('cy',  8*vis.height/16)
            .attr('r', vis.radiusScale(96))
            .attr('fill', 'white')
            .attr('stroke', 'none')
            .attr('opacity', '0.6')

        vis.svg.append('g')
            .attr('class', 'centerLabel label legend')
            .attr("transform", "translate(" +12.5* vis.width / 16 + "," + 8* vis.height / 16 + ")")
            .append('text')
            .text("Climb")
            .call(vis.wrap, vis.width/6)

        vis.svg.append('g')
            .attr('class', 'centerLabel label')
            // .attr("transform", "translate(" +3* vis.width / 16 + "," + 1* vis.height / 16 + ")")
            .append('circle')
            .attr('cx',12*vis.width/16)
            .attr('cy',  9*vis.height/16)
            .attr('r', vis.radiusScale(96))
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', '3pt')
            .attr('opacity', '1')

        vis.svg.append('g')
            .attr('class', 'centerLabel label legend')
            .attr("transform", "translate(" +12.5* vis.width / 16 + "," + 9* vis.height / 16 + ")")
            .append('text')
            .text("Record-Setting Climb")
            .call(vis.wrap, vis.width/6)

        vis.svg.append('svg:image')
            .attr('class', 'centerLabel label noseimage')
            .attr("transform", "translate(" +0.5* vis.width / 16 + "," + 4* vis.height / 16 + ")")
            .attr("xlink:href", function() {return "./imgs/thenose5.png"})
            .attr('width', "50")
            .attr('height', "50")
    }


    // }

    recordLabels(vis) {
        // at some point, I could just create an array with the text and the x,y coordinates and pass them in as the data to make rather than having GOD KNOWS HOW MANY DIFFERENT CREATIONS OF EACH INDIVIDUAL LABEL. Dummy.
        // how to pass d into transform/translate attribute though??
        // vis.recordLabels = [
        //     {Name: 'None', x: 4 * vis.width / 16, y: 13 * vis.height / 16},
        //     {Name: 'Classic', x: 4 * vis.width / 8, y: 13 * vis.height / 16},
        //     {Name: 'Solo', x:4 * vis.width / 8, y: 3 * vis.height / 16},
        //     {Name: '4-Person',x: 12 * vis.width / 16, y:13 * vis.height / 16},
        //     {Name: 'Male-Female',x: 12 * vis.width / 16, y: 3 * vis.height / 16}
        //
        // ]
        //
        // vis.svg.append('g')
        //     .datum(vis.recordLabels)
        //     .attr('class', 'recordLabel label')
        //     .attr("transform", "translate(" + 4 * vis.width / 8 + "," + 13 * vis.height / 16 + ")")
        //     .append('text')
        //     .style('text-anchor', 'start')
        //     .text(d=>d.Name)
        // console.log('record labels')
        vis.svg.append('g')
            .attr('class', 'recordLabel label')
            .attr("transform", "translate(" + 4 * vis.width / 8 + "," + 13 * vis.height / 16 + ")")
            .append('text')
            .style('text-anchor', 'start')
            .text('Classic')

        vis.svg.append('g')
            .attr('class', 'recordLabel label')
            .append('text')
            .attr("transform", "translate(" + 4 * vis.width / 8 + "," + 3 * vis.height / 16 + ")")
            .style('text-anchor', 'start')
            .text('Solo')

        vis.svg.append('g')
            .attr('class', 'recordLabel label')
            .append('text')
            .attr("transform", "translate(" + 12 * vis.width / 16 + "," + 3 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('Male-Female')

        vis.svg.append('g')
            .attr('class', 'recordLabel label')
            .append('text')
            .attr("transform", "translate(" + 12 * vis.width / 16 + "," + 13 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('4-Person')

        vis.svg.append('g')
            .attr('class', 'recordLabel label')
            .append('text')
            .attr("transform", "translate(" +4 * vis.width / 16 + "," + 13 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('None')
    }


    partnerLabels(vis){
        // console.log( 'partner labels')

        vis.svg.append('g')
            .attr('class', 'partnerLabel label')
            .attr("transform", "translate(" + 4 * vis.width / 16 + "," + 3.5 * vis.height / 16 + ")")
            .append('text')
            .style('text-anchor', 'start')
            .text('0')

        vis.svg.append('g')
            .attr('class', 'partnerLabel label')
            .append('text')
            .attr("transform", "translate(" + 6.25 * vis.width / 16 + "," + 8.5 * vis.height / 16 + ")")
            .style('text-anchor', 'start')
            .text('1')

        vis.svg.append('g')
            .attr('class', 'partnerLabel label')
            .append('text')
            .attr("transform", "translate(" + 12.5 * vis.width / 16 + "," + 4 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('2')

        vis.svg.append('g')
            .attr('class', 'partnerLabel label')
            .append('text')
            .attr("transform", "translate(" + 1 * vis.width / 16 + "," + 8.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('3')

        vis.svg.append('g')
            .attr('class', 'partnerLabel label')
            .append('text')
            .attr("transform", "translate(" +15 * vis.width / 16 + "," + 8.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('4')

        vis.svg.append('g')
            .attr('class', 'partnerLabel label')
            .append('text')
            .attr("transform", "translate(" +4 * vis.width / 16 + "," + 13.25 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('5')

        vis.svg.append('g')
            .attr('class', 'partnerLabel label')
            .append('text')
            .attr("transform", "translate(" +12.5 * vis.width / 16 + "," + 13.25 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('6')
    }

    monthLabels(vis){
        // console.log( 'month labels')

        vis.svg.append('g')
            .attr('class', 'monthLabel label')
            .attr("transform", "translate(" +3.25* vis.width / 16 + "," + 1* vis.height / 16 + ")")
            .append('text')
            .style('text-anchor', 'start')
            .text('MAR')

        vis.svg.append('g')
            .attr('class', 'monthLabel label')
            .append('text')
            .attr("transform", "translate(" + 7.5 * vis.width / 16 + "," + 1 * vis.height / 16 + ")")
            .style('text-anchor', 'start')
            .text('MAY')

        vis.svg.append('g')
            .attr('class', 'monthLabel label')
            .append('text')
            .attr("transform", "translate(" + 12.25 * vis.width / 16 + "," + 1 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('JUN')

        vis.svg.append('g')
            .attr('class', 'monthLabel label')
            .append('text')
            .attr("transform", "translate(" + 3.75 * vis.width / 16 + "," + 8.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('JUL')

        vis.svg.append('g')
            .attr('class', 'monthLabel label')
            .append('text')
            .attr("transform", "translate(" +12.25 * vis.width / 16 + "," + 8.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('AUG')

        vis.svg.append('g')
            .attr('class', 'monthLabel label')
            .append('text')
            .attr("transform", "translate(" +3.75* vis.width / 16 + "," + 15.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('SEP')

        vis.svg.append('g')
            .attr('class', 'monthLabel label')
            .append('text')
            .attr("transform", "translate(" +8 * vis.width / 16 + "," + 15.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('OCT')

        vis.svg.append('g')
            .attr('class', 'monthLabel label')
            .append('text')
            .attr("transform", "translate(" +12.5 * vis.width / 16 + "," + 15.5 * vis.height / 16 + ")")
            .style('text-anchor', 'middle')
            .text('NOV')
    }

    colorLegend(vis){
        vis.svg.append('g')
            .attr('class', 'centerLabel label')
            // .attr("transform", "translate(" +3* vis.width / 16 + "," + 1* vis.height / 16 + ")")
            .append('circle')
            .attr('cx',6*vis.width/16)
            .attr('cy',  15*vis.height/16)
            .attr('r', vis.radiusScale(30))
            .attr('fill', vis.colorRecords2('None'))
            .attr('stroke', 'black')
            .attr('stroke-width', '2pt')
            .attr('opacity', '1')


    }

    wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.2, // ems
                y = text.attr("y"),
                dy = 0,
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr('dy', dy);
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", +lineHeight +"em").text(word);
                }
            }
        });
    }
}

