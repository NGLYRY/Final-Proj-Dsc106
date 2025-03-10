document.addEventListener('DOMContentLoaded', function() {
    // Initialize the visualization but don't display it yet
    createInteractiveChart('visualization-container');
    
    // Get references to UI elements
    const tabItems = document.querySelectorAll('.tab-item');
    const narratives = document.querySelectorAll('.narrative');
    const toggleContainer = document.getElementById('toggle-container');
    const dataTypeRadios = document.querySelectorAll('input[name="dataType"]');
    const visualizationPanel = document.querySelector('.visualization-panel');
    const narrativePanel = document.querySelector('.narrative-panel');
    
    // CRITICAL: Hide visualization, narrative panel and toggle container initially
    if (visualizationPanel) {
        visualizationPanel.style.display = 'none';
    }
    
    if (narrativePanel) {
        narrativePanel.style.display = 'none';
    }
    
    // Ensure toggle container is hidden at startup
    if (toggleContainer) {
        toggleContainer.classList.add('hidden');
    }
    
    // Set up tab item click handlers
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            // Update active tab
            tabItems.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            
            // Update visible narrative
            const phase = this.dataset.phase;
            narratives.forEach(narrative => narrative.classList.remove('active'));
            document.getElementById(`${phase}-narrative`).classList.add('active');
            
            // Show toggle container for all phases
            toggleContainer.classList.remove('hidden');
            
            // Hide the visualization and narrative until data type is selected
            if (visualizationPanel) {
                visualizationPanel.style.display = 'none';
            }
            
            if (narrativePanel) {
                narrativePanel.style.display = 'none';
            }
            
            // Update h2 title to match selected phase
            const narrativeTitle = document.querySelector('#narrative-content h2');
            if (narrativeTitle) {
                narrativeTitle.textContent = phase.charAt(0).toUpperCase() + phase.slice(1) + ' Phase';
            }
            
            // Store the selected phase as a data attribute for later use
            toggleContainer.dataset.selectedPhase = phase;
            
            // Clear any previously selected radio button
            dataTypeRadios.forEach(radio => {
                radio.checked = false;
            });
        });
    });
    
    // Set up data type toggle handlers
    dataTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Get the previously selected phase
            const selectedPhase = toggleContainer.dataset.selectedPhase;
            
            // Show the visualization panel and narrative panel now that both selections are made
            if (visualizationPanel) {
                visualizationPanel.style.display = 'block';
            }
            
            if (narrativePanel) {
                narrativePanel.style.display = 'block';
            }
            
            // Update visualization with the stored phase and selected data type
            updateVisualization(selectedPhase, this.value);
        });
    });
    
    // Helper function to get current data type
    function getCurrentDataType() {
        return document.querySelector('input[name="dataType"]:checked')?.value || 'bvp';
    }
    
    // Function to update visualization based on selected phase and data type
    function updateVisualization(phase, dataType) {
        // Programmatically set the dropdown values in your existing visualization
        const select1 = document.getElementById("visualization-container-select1");
        const select2 = document.getElementById("visualization-container-select2");
        
        if (select1 && select2) {
            // Set values and trigger change events
            select1.value = phase;
            select2.value = dataType;
            
            // Manually trigger change event - this is crucial
            const event = new Event('change');
            select1.dispatchEvent(event);
        }
    }
});