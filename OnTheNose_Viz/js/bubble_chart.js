class BubbleChart {


    constructor(_parentElement, data) {
        this.parentElement = _parentElement;
        // this.legendElement = _legendElement;
        this.data = data;
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
            .attr('transform', `translate (${vis.width / 2}, ${vis.height / 2})`);


        // set up scale for radius
        vis.maxRadius =
        vis.radiusScale = d3.scalePow()
            .exponent(0.5)
            .range([2,25])
            .domain([0, d3.max(vis.data, d=>d.HoursRounded)])

        // console.log(vis.radiusScale(96))

        // onl
        vis.nodes=vis.createNodes()

        // var simulation = forceSimulation()
        //     .velocityDecay(0.2)
        //
        // simulation.stop() //pauses the simulation until nodes are created
        //
        // simulation.force('center', d3.forceCenter(width/2, height/2));
        //
        // var center = {x: width / 2, y: height / 2};
        // var forceStrength = 0.03;
        //
        // var simulation = d3.forceSimulation()
        //     .velocityDecay(0.2)
        //     .force('x', d3.forceX().strength(forceStrength).x(center.x))
        //     .force('y', d3.forceY().strength(forceStrength).y(center.y))
        //     .force('charge', d3.forceManyBody().strength(charge))
        //     .on('tick', ticked);

        // vis.wrangleData()
    }

    wrangleData(selectedGroup){
        // only called in buttons are clicked, otherwise x,y are assigned default random values
        let vis = this;
        vis.selectedGroup = selectedGroup;

        console.log(vis.selectedGroup)
        // depending on button selected, assign new x,y coordinates to



        // vis.updateVis()
    }

    updateVis(){
        let vis = this;

    }

    createNodes() {
         let vis = this;

         let nodes = []
         vis.data.forEach((d,i)=> {
             // console.log(d)
             nodes.push({
                 id: i,
                 scaled_radius: vis.radiusScale(d.HoursRounded),
                 actual_radius: d.HoursRounded,
                 color_fill: d.Record===''? 'white' : 'black',
                 year: d.Year,
                 month: d.Month,
                 numPartner: d['Num. Partners'],
                 award: d.Record===''? 'none' : d.Record,
                 x: Math.random()*900,
                 y: Math.random()*800
             })
         })

        console.log(nodes)



    }
}

