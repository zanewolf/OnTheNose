/*
* BubbleVis - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data						-- the actual data
*
*
 *
 * author: Zane
 * modified from:
 * date created:
 * date last modified:
 */


class BubbleVis {


    constructor(_parentElement, data) {
        this.parentElement = _parentElement;
        // this.legendElement = _legendElement;
        this.Data = data;
        //this.practiceData = practiceData;
        // console.log(this.data[4])

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        // define margins
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;


        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width / 2}, ${vis.height / 2})`);
        //

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        vis.updateVis()
    }


    updateVis(){

    }
}
