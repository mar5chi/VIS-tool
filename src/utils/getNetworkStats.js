export function getNetworkStats(network) {
    let nwStats = [0.0, 0.0, 0, 0];
  
    const graph = network.graphs[0];
  
    nwStats[0] = graph.id;
    nwStats[1] = graph.label;
    nwStats[2] = parseInt(graph.metadata["Number of runs"]["values"][0]);
  
    return nwStats;
  }
  
  export function getAllNodesTemperature(network) {
    let temps = [];
  
    const graph = network.graphs[0];
    const nodes_ = graph.nodes;
  
    for (const n in nodes_) {
      const tempArray = nodes_[n].metadata["Temperature [C]"]["values"]; // is array now
      for (let i = 0; i < tempArray.length; i++) {
        const name = "V" + (i + 1);
        temps.push({ name: name, value: tempArray[i] });
      }
    }
  
    return temps;
  }
  
  export function getIndoorNodesTemperature(network) {
    let temps = [];
  
    const graph = network.graphs[0];
    const nodes_ = graph.nodes;
  
    for (const n in nodes_) {
      if (n.startsWith("IndoorId")) {
        const tempArray = nodes_[n].metadata["Temperature [C]"]["values"]; // is array now
        for (let i = 0; i < tempArray.length; i++) {
          const name = "V" + (i + 1);
          temps.push({ name: name, value: tempArray[i] });
        }
      }
    }
  
    return temps;
  }
  
  export function getNodesHeat(network) {
    let heat = [];
  
    const graph = network.graphs[0];
    const nodes_ = graph.nodes;
  
    for (const n in nodes_) {
      const heatArray = nodes_[n].metadata["Heat [W]"]["values"]; // is array now
      for (let i = 0; i < heatArray.length; i++) {
        const name = "V" + (i + 1);
        heat.push({ name: name, value: heatArray[i] });
      }
    }
  
    return heat;
  }
  
  export function getEdgesHeat(network) {
    let heat = [];
  
    const graph = network.graphs[0];
    const edges_ = graph.edges;
  
    edges_.forEach(handleEdges); // array.forEach()
    function handleEdges(item, index, arr) {
      const heatArray = item.metadata["Heat [W]"]["values"]; // array
      for (let i = 0; i < heatArray.length; i++) {
        const name = "V" + (i + 1);
        let value = heatArray[i];
        if (value === 0.0 ) value = 0.000001
        heat.push({ name: name, value: value });
      }
    }
  
    return heat;
  }
  
  export function getEdgesUvalue(network) {
      let uval = [];
    
      const graph = network.graphs[0];
      const edges_ = graph.edges;
    
      edges_.forEach(handleEdges); // array.forEach()
      function handleEdges(item, index, arr) {
        const uvalArray = item.metadata["U-Value [W / m²K]"]["values"]; // array
        for (let i = 0; i < uvalArray.length; i++) {
          const name = "V" + (i + 1);
          uval.push({ name: name, value: uvalArray[i] });
        }
      }
    
      return uval;
    }
  
    export function getEdgesLvalue(network) {
      let lval = [];
    
      const graph = network.graphs[0];
      const edges_ = graph.edges;
    
      edges_.forEach(handleEdges); // array.forEach()
      function handleEdges(item, index, arr) {
        const lvalArray = item.metadata["L-Value [W / K]"]["values"]; // array
        for (let i = 0; i < lvalArray.length; i++) {
          const name = "V" + (i + 1);
          lval.push({ name: name, value: lvalArray[i] });
        }
      }
    
      return lval;
    }
  