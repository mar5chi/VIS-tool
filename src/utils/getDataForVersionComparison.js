export function getNodesTempIndoor(network, versionNumbers) {
  let temp = [];

  const graph = network.graphs[0];
  const nodes_ = graph.nodes;

  versionNumbers.forEach(handleVns); // array.forEach()
  function handleVns(item, index, arr) {
    for (const n in nodes_) {
      if (n.startsWith("IndoorId")) {
        let room = {};
        room["version"] = item.label;
        const tempArray = nodes_[n].metadata["Temperature [C]"]["values"]; // is array now
        const label = nodes_[n].label.split(" - ")[0].replace(/\s/g, "").replace(".", ""); // remove space and dot
        room["label"] = label;
        room["temp"] = Math.round(tempArray[item.value] * 1000) / 1000;  // round for display
        temp.push(room);
      }
    }
  }
  return temp;
}

export function getNodesHeatIndoor(network, versionNumbers) {
  let heat = [];

  const graph = network.graphs[0];
  const nodes_ = graph.nodes;

  versionNumbers.forEach(handleVns); // array.forEach()
  function handleVns(item, index, arr) {
    for (const n in nodes_) {
      if (n.startsWith("IndoorId")) {
        let room = {};
        room["version"] = item.label;
        const heatArray = nodes_[n].metadata["Heat [W]"]["values"]; // is array now
        const label = nodes_[n].label.split(" - ")[0].replace(/\s/g, "").replace(".", ""); // remove space and dot
        room["label"] = label;
        room["heat"] = Math.round(heatArray[item.value] * 10) / 10;  // round for display
        heat.push(room);
      }
    }
  }
  return heat;
}

export function getEdgesHeat(network, versionNumbers) {
  let heat = [];

  const graph = network.graphs[0];
  const edges_ = graph.edges;

  edges_.forEach(handleEdges); // array.forEach()
  function handleEdges(item, index, arr) {
    const heatArray = item.metadata["Heat [W]"]["values"]; // array
    const edgeLabel = item.label;
    const area = item.metadata["Area [m²]"]["values"][0];
    versionNumbers.forEach(handleVns); // array.forEach()
    function handleVns(item, index, arr) {
      const name = item.label;  // version name (eg. v1)
      let value = Math.abs(heatArray[item.value]);
      if (value === 0.0 ) value = 0.000001
      heat.push({ name: name, value: value, label: edgeLabel, area: area });
    }
  }
  return heat;
}

export function getEdgesHeatFluxDensity(network, versionNumbers) {
  let heatDens = [];

  const graph = network.graphs[0];
  const edges_ = graph.edges;

  edges_.forEach(handleEdges); // array.forEach()
  function handleEdges(item, index, arr) {
    const heatArray = item.metadata["Heat [W]"]["values"]; // array
    const edgeLabel = item.label;
    const area = item.metadata["Area [m²]"]["values"][0];
    versionNumbers.forEach(handleVns); // array.forEach()
    function handleVns(item, index, arr) {
      const name = item.label;  // version name (eg. v1)
      let value = Math.abs(heatArray[item.value]) / area;
      if (value === 0.0 ) value = 0.000001
      heatDens.push({ name: name, value: value, label: edgeLabel, area: area });
    }
  }
  return heatDens;
}
