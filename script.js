// Load data
d3.csv('modified_file.csv').then(data => {
  // Convert Height and Weight to numbers

  let isFiltered = false;

const heightInput = d3.select('#height-filter');
const weightInput = d3.select('#weight-filter');
const findZoneBtn = d3.select('#find-zone-btn');
const errorMsg = d3.select('#error-msg');
const resetBtnContainer = d3.select('.filter-container');

findZoneBtn.on('click', () => {
  const heightValue = +heightInput.property('value');
  const weightValue = +weightInput.property('value');

  if (!heightValue || !weightValue) {
    errorMsg.text('You need to input both to run this');
    if (!heightValue) heightInput.style('border', '2px solid red');
    if (!weightValue) weightInput.style('border', '2px solid red');
  } else {
    errorMsg.text('');
    heightInput.style('border', '');
    weightInput.style('border', '');

    updateCircleOpacity();
    showResetBtn();
    isFiltered = true;
  }
});

function updateCircleOpacity() {
  const heightThreshold = 10; 
  const weightThreshold = 10; 
  const filteredHeight = +heightInput.property('value');
  const filteredWeight = +weightInput.property('value');

  svg.selectAll('circle')
    .transition()
    .duration(500)
    .attr('opacity', d => {
      const heightDiff = Math.abs(d.Height - filteredHeight);
      const weightDiff = Math.abs(d.Weight - filteredWeight);
      if (heightDiff <= heightThreshold && weightDiff <= weightThreshold) {
        return 1; 
      } else if (heightDiff <= 2 * heightThreshold && weightDiff <= 2 * weightThreshold) {
        return 0.5; 
      } else {
        return 0.1; 
      }
    });
}

function showResetBtn() {
  const resetBtn = resetBtnContainer
    .append('span')
    .attr('id', 'reset-btn')
    .style('margin-left', '10px')
    .style('color', '#666')
    .style('cursor', 'pointer')
    .text('Reset');

  resetBtn.on('click', () => {
    heightInput.property('value', '');
    weightInput.property('value', '');
    svg.selectAll('circle').attr('opacity', 1);
    resetBtn.remove();
    errorMsg.text('');
    heightInput.style('border', '');
    weightInput.style('border', '');
    isFiltered = false;
  });
}
  
  data.forEach(d => {
      d.Height = +d['Height(Centimeter)'];
      d.Weight = +d['Weight(Kilograms)'];

      // Extract RGB values for each color
      d.PantsColor = JSON.parse(d['Pants Color']);
      d.SkinColor = JSON.parse(d['Skin Color']);
      d.ClothesColor = JSON.parse(d['Clothes Color']);
  });

  // Sampling
  const sampleSize = 500; 
  const sampledData = data.filter((d, i) => i % Math.floor(data.length / sampleSize) === 0);

  // Set default color
  let colorKey = 'SkinColor';

  // Create scatter plot
  const svg = d3.select('svg');
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = svg.attr('width') - margin.left - margin.right;
  const height = svg.attr('height') - margin.top - margin.bottom;

  const xScale = d3.scaleLinear()
      .domain([30, d3.max(sampledData, d => d.Weight)]).range([0, width]);

  const yScale = d3.scaleLinear()
      .domain([140, d3.max(sampledData, d => d.Height)]).range([height, 0]);

  // Tooltip
  const tooltip = d3.select('body')
  .append('div')
  .style('position', 'absolute')
  .style('padding', '10px')
  .style('background', 'white')
  .style('border', '1px solid #ddd')
  .style('opacity', 0);

  svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
  .selectAll('circle')
  .data(sampledData)
  .enter()
  .append('circle')
  .attr('cx', d => xScale(d.Weight))
  .attr('cy', d => yScale(d.Height))
  .attr('r', 5)
  .attr('fill', d => `rgb(${d[colorKey].r}, ${d[colorKey].g}, ${d[colorKey].b})`)
  .on('mouseover', (event, d) => {
      console.log('Hovered on circle:', d);
      tooltip
          .style('opacity', 1)
          .html(`
              <b>Height:</b> ${d.Height} cm<br>
              <b>Weight:</b> ${d.Weight} kg<br>
              <b>Gender:</b> ${d.Gender}<br>
              <b>BMI:</b> ${d.BMI}
          `);
      tooltip.style('left', `${event.pageX}px`).style('top', `${event.pageY}px`);
  })
  .on('mouseout', () => {
      if (!d3.select(this).node().closest('circle:hover')) {
          tooltip.style('opacity', 0);
      }
  })
  .on('mousemove', (event) => {
      tooltip.style('left', `${event.pageX}px`).style('top', `${event.pageY}px`);
  });


  // Add axes
  svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
      .call(d3.axisBottom(xScale));

  svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(d3.axisLeft(yScale));

  // Update color on dropdown change
d3.select('#color-select').on('change', function() {
    colorKey = d3.select(this).property('value');

    svg.selectAll('circle')
        .transition()
        .duration(500)
        .attr('fill', d => {
            const color = JSON.parse(d[colorKey]);
            return `rgb(${color.r}, ${color.g}, ${color.b})`;
        });
});
}).catch(error => console.error(error));