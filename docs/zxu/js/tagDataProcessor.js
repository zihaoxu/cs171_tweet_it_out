class TagDataProcessor{
    constructor(dataset) {
        this.node_data = dataset[0].nodes;
        this.edge_data = dataset[1].edges;
    }

    processData(start_date, end_date){
        let pro = this;

        // Filter data by dates
        pro.node_data = pro.node_data.filter((d, i) => {
                return d.date >= start_date & d.date <= end_date
            }
        )
        pro.edge_data = pro.edge_data.filter((d, i) => {
                return d.date >= start_date & d.date <= end_date
            }
        )

        // Get top 10 hashtags
        let tags_count = {};
        pro.node_data.forEach((d) => {
            let tag_id = d.tag_id,
                row_id = d.row_id,
                tag = d.tag;
            if(!Object.keys(tags_count).includes(tag_id.toString())){
                tags_count[tag_id] = {'row_id':row_id, 'tag_name':tag, 'tag_count':1};
            }else{
                tags_count[tag_id].tag_count += 1;
            }
        })

        // convert object to array
        let node_data_process = Object.values(tags_count);

        // Trim the array down to at most 20 tags
        if(node_data_process.length > 20){
            node_data_process.sort(function(a,b) {
                return b.tag_count - a.tag_count
            })
            node_data_process = node_data_process.slice(0, 20);
        }

        // Extract top tags
        let top_tags = [];
        node_data_process.forEach((d) => {
            top_tags.push(d.tag_name);
        })

        // Filter edges by top_tags
        pro.edge_data = pro.edge_data.filter(d => {
            return top_tags.includes(d.source_tag) && top_tags.includes(d.target_tag)
        })

        // Count the edges
        let edges_count = {};
        pro.edge_data.forEach((d) => {
            let a_id = top_tags.indexOf(d.source_tag),
                b_id = top_tags.indexOf(d.target_tag)
            let k = a_id.toString() + "," + b_id.toString();
            let v = {"row_id": d.row_id,
                     "source_tag": d.source_tag,
                     "target_tag": d.target_tag};
            if (a_id != b_id){ // rid of self loops
                if(!Object.keys(edges_count).includes(k)){
                    edges_count[k] = v;
                    edges_count[k].edge_count = 1;
                }else{
                    edges_count[k].edge_count += 1;
                }
            }
        })

        // Extract edge json
        let edge_data_process = Object.values(edges_count);

        // Filter nodes to exclude ones without edge
        let seen_nodes = new Set()
        edge_data_process.forEach(d => {
            seen_nodes.add(d.source_tag);
            seen_nodes.add(d.target_tag);
        })

        seen_nodes = Array.from(seen_nodes);

        node_data_process = node_data_process.filter(d => {
            return seen_nodes.includes(d.tag_name)
        })

        // Add source and target to edges
        edge_data_process.forEach((d, i) => {
            let id1 = seen_nodes.indexOf(d.source_tag),
                id2 = seen_nodes.indexOf(d.target_tag);
            d.source = id1;
            d.target = id2;
        })

        node_data_process.forEach(d => {
            d.id = seen_nodes.indexOf(d.tag_name);
        })
        node_data_process.sort((a,b)=>{
            return a.id-b.id
        })

        return [{'nodes': node_data_process},
                {'edges': edge_data_process}]
    }
}