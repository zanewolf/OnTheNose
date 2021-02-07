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

        // vis.nodes=[]


        //set up svg area
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;


        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            // .attr('transform', `translate (${vis.width / 2}, ${vis.height / 2})`);
        // commented transform out because it was throwing off all the position calculations

        // init tooltip

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'tooltip');



        // set up scale for radius
        vis.radiusScale = d3.scalePow()
            .exponent(0.5)
            .range([1,40])
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

        vis.plotBubbles(vis.centerBubbles);

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

    plotBubbles(coordGenerator) {
        // only called if buttons are clicked, otherwise x,y are assigned default random values
        let vis = this;

        // vis.selectedGroup = selectedGroup;
        // console.log(coordGenerator)
        // function centerBubbles(){
        //     return (vis.width/2);
        // }

        vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(coordGenerator));

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
     centerBubbles(d){
        console.log('centerbubbles',d)
        return (900/2);
     //   return (vis.width/2);
     }

     splitByRecords(vis,d){
        console.log('splitbyRecoreds',d)
         return
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

