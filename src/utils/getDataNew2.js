export function getNumberOfRuns(network) {
  const graph = network.graphs[0];
  const numberOfRuns = parseInt(graph.metadata["Number of runs"]["values"][0]);
  
  return numberOfRuns;
}

export function getOverviewData(network, dn) {
    //const dn = 16;   // Design number
    let allNodes = [];
    let allLinks = [];
    let aggregatedLinks = [];
    const tAreaMinMax = [1000.0, 0.0]; // for the animation
    const uValMinMax = [1000.0, 0.0];
    const rValMinMax = [1000.0, 0.0];
  
    const graph = network.graphs[0];
    const edges_ = graph.edges;
    const nodes_ = graph.nodes;
  
    // Nodes ----------------------------------------------
    for (const n in nodes_) {
      // nodes_ is an Object
      const heat = nodes_[n].metadata["Heat [W]"]["values"];          // is array now 
      const tempArray = nodes_[n].metadata["Temperature [C]"]["values"];   // is array now
      const temp = Number(tempArray[dn])
      //console.log("type node temp:")
      //console.log(typeof(temp));
      const col = getColor(temp);
      const isAR = n.startsWith("OutdoorId") || n.startsWith("EarthId");
      //const col = "#0571b0";            // TODO
      allNodes.push({
        id: n,
        label: nodes_[n].label.split(" - ")[0],
        heat: Number(heat[dn]),
        temp: temp,
        hoverText: nodes_[n].label.split(" - ")[0] + ", heat: " + Math.round(Number(heat[dn])*1000)/1000 
                  + " W, temp: " + Math.round(temp*1000)/1000 + "°C",
        color: col,
        isAR: isAR,
      });
    } // end Nodes ----------------------------------------
    // Edges --------------------------------------------------------
    edges_.forEach(handleEdges); // array.forEach()
    function handleEdges(item, index, arr) {
      const area = Number(item.metadata["Area [m²]"]["values"][0]);
      const heatArray = item.metadata["Heat [W]"]["values"];  // array
      const uValArray = item.metadata["U-Value [W / m²K]"]["values"];
      const rValArray = item.metadata["R-Value [m²K / W]"]["values"];
      const temp1Array = item.metadata["SurfTemp1 [C]"]["values"];
      const temp2Array = item.metadata["SurfTemp2 [C]"]["values"];
      allLinks.push({
        id: item.id,
        label: item.label,
        source: item.source,
        target: item.target,
        transferArea: area,
        heat: Number(heatArray[dn]),
        uValue: Number(uValArray[dn]),
        rValue: Number(rValArray[dn]),
        temp1: Number(temp1Array[dn]),
        temp2: Number(temp2Array[dn]),
        hoverText: "area: " + area + ", heat: " + Number(heatArray[dn]) + "uVal: " + uValArray[dn] + "rVal: " + rValArray[dn],
        curvature: 0, // 0 -> straight line for overview
        particles: 0, // 0 for now, update later according to aggregated values min max
        particleWidth: 0, // 0 for now, update later according to aggregated values min max
        arrowLength: 2,
        visited: false,
      });
    }
  
    // find parallel links to aggregate
    for (let i = 0; i < allLinks.length; i++) {
      const link = allLinks[i];
      const filter = {
        source: link.source,
        target: link.target,
      };
      const parallels = allLinks.filter(
        (obj) =>
          obj.source === filter.source &&
          obj.target === filter.target &&
          !obj.visited
      );
  
      if (parallels.length > 1) {
        // parallel links to aggregate
        let sumArea = 0.0;
        let sumHeat = 0.0;
        //let aggRVal = 0.0;
        parallels.forEach((item) => {
          sumArea += item.transferArea;
          sumHeat += item.heat;
          //sumWeightedRVal += item.transferArea * item.rValue;
          // set visited in allLinks
          const idx = allLinks.findIndex((obj) => obj.id === item.id);
          allLinks[idx].visited = true;
        });
        //const aggregRVal = Math.round((sumWeightedRVal / sumArea) * 1000) / 1000;  // TODO Wärmestromdichte q
        const aggregUVal = Math.abs(sumHeat / (sumArea * (link.temp1 - link.temp2)));  // TODO Wärmestromdichte q
        aggregatedLinks.push({
          id: "aggregatedIds",
          source: link.source,
          target: link.target,
          uValue: aggregUVal,
          rValue: 1 / aggregUVal,
          transferArea: sumArea,
          hoverText:
            "area: " + Math.round(sumArea*1000)/1000 + " m², heat: " + Math.round(sumHeat*1000)/1000 
            + " W, uVal: " + Math.round(aggregUVal*1000)/1000 + " (aggregated)",
          curvature: 0,
          particles: 0, // 0 for now, update later according to aggregated values min max
          particleWidth: 0, // 0 for now, update later according to aggregated values min max
          arrowLength: 2,
        });
      } else {
        // link has no parallels
        if (parallels.length === 1) {
          aggregatedLinks.push({
            id: link.id,
            source: link.source,
            target: link.target,
            uValue: link.uVal,
            rValue: link.rValue,
            transferArea: link.transferArea,
            hoverText: 
              "area: " + Math.round(link.transferArea*1000)/1000 +  " m², heat: " + Math.round(link.heat*1000)/1000 
              + " W, uVal: " + link.uValue,
            curvature: link.curvature,
            particles: link.particles,
            particleWidth: link.particleWidth,
            arrowLength: 2,
          });
        }
      }
    }
  
    // update aggregatedLinks particles according to min max with aggregated values
    aggregatedLinks.forEach(setUValMinMax); // array.forEach()
    function setUValMinMax(item) {
      const uValue = item.uValue;
      if (uValue < uValMinMax[0]) uValMinMax[0] = uValue;
      if (uValue > uValMinMax[1]) uValMinMax[1] = uValue;
    }
    aggregatedLinks.forEach(setRValMinMax); // array.forEach()
    function setRValMinMax(item) {
      const rValue = item.rValue;
      if (rValue < rValMinMax[0]) rValMinMax[0] = rValue;
      if (rValue > rValMinMax[1]) rValMinMax[1] = rValue;
    }
    aggregatedLinks.forEach(setTAreaMinMax); // array.forEach()
    function setTAreaMinMax(item) {
      const tArea = item.transferArea;
      if (tArea < tAreaMinMax[0]) tAreaMinMax[0] = tArea;
      if (tArea > tAreaMinMax[1]) tAreaMinMax[1] = tArea;
    }
    aggregatedLinks.forEach(updateParticles); // array.forEach()
    function updateParticles(item, index, arr) {
      const uVal = item.uValue;
      const tArea = item.transferArea;
      const particles = getParticles(uVal, uValMinMax);
      const particleWidth = getParticleWidth(tArea, tAreaMinMax);
      item.particles = particles;
      item.particleWidth = particleWidth;
    }
  
    // set flow direction according to temperature (from hot to cold)
    aggregatedLinks.forEach(updateFlowDirection); // array.forEach()
    function updateFlowDirection(item, index, arr) {
      const s = item.source;
      const t = item.target;
      let sourceTemp = -999;
      let targetTemp = -999;
      for (let i = 0; i < allNodes.length; i++) {
        if (allNodes[i].id === s) sourceTemp = allNodes[i].temp;
        if (allNodes[i].id === t) targetTemp = allNodes[i].temp;
      }
      if (targetTemp > sourceTemp) {
        item.source = t;
        item.target = s;
      }
      else {
        if (targetTemp === sourceTemp)
          item.arrowLength = 0;
      }
    }
    // end Edges ----------------------------------------------------------------------------------
  
    return { nodes: allNodes, links: aggregatedLinks };
  }
  
  export function getDetailData(network, nodeId, dn) {
    let detailNodes = [];
    let detailLinks = [];
    const tAreaMinMax = [1000.0, 0.0];
    const uValMinMax = [1000.0, 0.0];
    const rValMinMax = [1000.0, 0.0];
  
    const graph = network.graphs[0];
    const edges_ = graph.edges;
    const nodes_ = graph.nodes;
  
    // Edges --------------------------------------------------------
    edges_.forEach(setUValMinMax); // array.forEach()
    function setUValMinMax(item) {
      const uValueArray = item.metadata["U-Value [W / m²K]"]["values"];  // array
      const uValue = Number(uValueArray[dn]);
      if (uValue < uValMinMax[0]) uValMinMax[0] = uValue;
      if (uValue > uValMinMax[1]) uValMinMax[1] = uValue;
    }
    edges_.forEach(setRValMinMax); // array.forEach()
    function setRValMinMax(item) {
      //const rValue = Number(item.metadata.rValue);
      const rValueArray = item.metadata["R-Value [m²K / W]"]["values"];  // array
      const rValue = Number(rValueArray[dn]);
      if (rValue < rValMinMax[0]) rValMinMax[0] = rValue;
      if (rValue > rValMinMax[1]) rValMinMax[1] = rValue;
    }
    edges_.forEach(setTAreaMinMax); // array.forEach()
    function setTAreaMinMax(item) {
      const tArea = Number(item.metadata["Area [m²]"]["values"][0]);
      if (tArea < tAreaMinMax[0]) tAreaMinMax[0] = tArea;
      if (tArea > tAreaMinMax[1]) tAreaMinMax[1] = tArea;
    }
  
    edges_.forEach(handleEdgesForSource); // array.forEach()
    function handleEdgesForSource(item, index, arr) {
      if (item.source === nodeId) {
        // find the edges where clicked node is source
        addDetailLink(item);
      }
    }
    edges_.forEach(handleEdgesForTarget); // array.forEach()
    function handleEdgesForTarget(item, index, arr) {
      if (item.target === nodeId) {
        // find the edges where clicked node is target
        addDetailLink(item);
      }
    }
  
    // set the curvatures
    detailLinks.forEach(checkParallel);
    function checkParallel(item, index, arr) {
      const filter = {
        source: item.source,
        target: item.target,
      };
      const parallels = arr.filter(
        (obj) => obj.source === filter.source && obj.target === filter.target
      );
  
      let i = parallels.length / -2.0;
      if (parallels.length > 1) {
        parallels.forEach((item) => (item.curvature = i++ / 5));
      }
    }
  
    function addDetailLink(item) {
      const area = Number(item.metadata["Area [m²]"]["values"][0]);
      const heatArray = item.metadata["Heat [W]"]["values"];  // array
      const heat = Number(heatArray[dn]);
      const uValArray = item.metadata["U-Value [W / m²K]"]["values"];  // array
      const uVal = Number(uValArray[dn]);
      const rValArray = item.metadata["R-Value [m²K / W]"]["values"];  // array
      const rVal = Number(rValArray[dn]);
      const lValArray = item.metadata["L-Value [W / K]"]["values"];  // array
      const lVal = Number(lValArray[dn]);
      //const lValArray = item.metadata["L-Value [W / K]"]["values"];  // array
      //const lVal = Number(lValArray[dn]);
      const sTemp1Array = item.metadata["SurfTemp1 [C]"]["values"];  // array
      const sTemp1 = Number(sTemp1Array[dn]);
      const sTemp2Array = item.metadata["SurfTemp2 [C]"]["values"];  // array
      const sTemp2 = Number(sTemp2Array[dn]);
      const compArray = item.metadata["Composition"]["values"];  // array
      const comp = compArray[dn];
      let particles = 0;
      if (Math.abs(heat) > 0.01) particles = getParticles(uVal, uValMinMax);
      const particleWidth = getParticleWidth(area, tAreaMinMax);
      const heatFluxDens = heat / area;
      detailLinks.push({
        id: item.id,
        label: item.label,
        source: item.source,
        target: item.target,
        rValue: rVal,
        transferArea: area,
        hoverText: item.label + ", area: " + Math.round(area*1000)/1000 + " m², heat: " + Math.round(heat*1000)/1000 
                              + " W, q: " + Math.round(heatFluxDens*1000)/1000 + " W/m², uVal: " + Math.round(uVal*1000)/1000 
                              + ", rVal: " + Math.round(rVal*1000)/1000 + ", lVal: " + Math.round(lVal*1000)/1000 + ", comp: " + comp
                              + ", st1: " + Math.round(sTemp1*1000)/1000 +  ", st2: " + Math.round(sTemp2*1000)/1000,
        curvature: 0, // 0 -> straight line for now, then check for parallel edges
        particles: particles,
        particleWidth: particleWidth,
        arrowLength: 2,
        visited: false,
      });
    }
    console.log("min R-Value:" + rValMinMax[0])
    console.log("max R-Value:" + rValMinMax[1])
    // end Edges ----------------------------------------------------------------------------------
  
    // Nodes ----------------------------------------------
    // 1. add the node that was clicked
    for (const n in nodes_) {
      // nodes_ is an Object
      if (n === nodeId) {
        addDetailNode(n);
      }
    }
    // 2. add the adjacent nodes
    for (const l in detailLinks) {
      // here l is the index because detailLinks is array
      const targetN = detailLinks[l].target;
      const sourceN = detailLinks[l].source;
      for (const n in nodes_) {
        // here n is the node id because nodes_ is object
        if (n === targetN) {
          let isAlreadyInDetailNodes = false;
          for (const dnod in detailNodes) {
            // here dn is the index because detailNodes is array
            if (n === detailNodes[dnod].id) {
              isAlreadyInDetailNodes = true;
            }
          }
          if (!isAlreadyInDetailNodes) {
            // add the nodes where the clicked node is target node
            addDetailNode(n);
          }
        }
        if (n === sourceN) {
          let isAlreadyInDetailNodes = false;
          for (const dnod in detailNodes) {
            // here dn is the index because detailNodes is array
            if (n === detailNodes[dnod].id) {
              isAlreadyInDetailNodes = true;
            }
          }
          if (!isAlreadyInDetailNodes) {
            // add the nodes where the clicked node is source node
            addDetailNode(n);
          }
        }
      }
    }
  
    function addDetailNode(n) {
      const heat = nodes_[n].metadata["Heat [W]"]["values"];                // is array now 
      const tempArray = nodes_[n].metadata["Temperature [C]"]["values"];    // is array now
      const temp = Number(tempArray[dn])
      const col = getColor(temp);
      const isAR = n.startsWith("OutdoorId") || n.startsWith("EarthId");
      //const col = "#0571b0";            // TODO
      detailNodes.push({
        id: n,
        label: nodes_[n].label.split(" - ")[0],
        heat: Number(heat[dn]),
        temp: temp,
        hoverText: nodes_[n].label.split(" - ")[0] + "  heat: " + Math.round(Number(heat[dn])*1000)/1000 
                  + " W, temp: " + Math.round(temp*1000)/1000 + " °C",
        color: col,
        isAR: isAR,
        arrowLength: 2,
      });
    }
  
    // set flow direction according to temperature (from hot to cold)
    detailLinks.forEach(updateFlowDirection); // array.forEach()
    function updateFlowDirection(item, index, arr) {
      const s = item.source;
      const t = item.target;
      let sourceTemp = -999;
      let targetTemp = -999;
      for (let i = 0; i < detailNodes.length; i++) {
        if (detailNodes[i].id === s) sourceTemp = detailNodes[i].temp;
        if (detailNodes[i].id === t) targetTemp = detailNodes[i].temp;
      }
      if (targetTemp > sourceTemp) {
        item.source = t;
        item.target = s;
      }
      else {
        if (targetTemp === sourceTemp)
          item.arrowLength = 0;
      }
    }
  
  
  
    return { nodes: detailNodes, links: detailLinks };
  }
  
  function getColor(temp) {
    switch (true) {
      case temp < 5:
        return "#0571b0";
      case temp < 19:
        return "#92c5de";
      case temp < 24:
        return "#f7f7f7";
      case temp < 27:
        return "#f4a582";
      case temp >= 27:
        return "#ca0020";
      default:
        return "#222222";
    }
  }
  
  function getParticles(uVal, uValMinMax) {
    // minmax normalization between 0 and 1
    const uValNormalized =
      (uVal - uValMinMax[0]) / (uValMinMax[1] - uValMinMax[0]);
    // then scale particle amount between 1 and 5
    const pMin = 1.0;
    const pMax = 5.0;
    const particles = uValNormalized * (pMax - pMin) + pMin;
  
    return particles;
  }
  
  function getParticleWidth(tArea, tAreaMinMax) {
    // minmax normalization between 0 and 1
    const tAreaNormalized =
      (tArea - tAreaMinMax[0]) / (tAreaMinMax[1] - tAreaMinMax[0]);
    // then scale particle width between 2 and 10
    const wMin = 2.0;
    const wMax = 10.0;
    const particleWidth = tAreaNormalized * (wMax - wMin) + wMin;
  
    return particleWidth;
  }
  