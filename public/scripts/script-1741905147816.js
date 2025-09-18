
(async function () {
    // Add this to your existing getPageData function
function getPageData() {
    // Collect tables data
    const tablesData = Array.from(document.querySelectorAll('table')).map((table, tableIndex) => {
        // Get table caption or first row to determine purpose
        const caption = table.querySelector('caption')?.textContent || '';
        const firstRow = table.querySelector('thead tr, tbody tr')?.textContent || '';
        
        // Extract column headers
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        
        // Count rows
        const rowCount = table.querySelectorAll('tbody tr').length;
        
        // Sample a few cell values to understand content (max 3 rows × 3 columns)
        const sampleData = [];
        const sampleRows = Array.from(table.querySelectorAll('tbody tr')).slice(0, 3);
        
        sampleRows.forEach(row => {
            const rowData = Array.from(row.querySelectorAll('td')).slice(0, 3).map(td => td.textContent.trim());
            if (rowData.length > 0) {
                sampleData.push(rowData);
            }
        });
        
        return {
            id: table.id || `table-${tableIndex}`,
            caption,
            className: table.className,
            headers,
            rowCount,
            columnCount: headers.length,
            sampleData,
            emptyText: table.querySelector('tbody')?.textContent.trim() === '' ? 'Empty table' : null
        };
    });
    
    // Collect lists data
    const listsData = Array.from(document.querySelectorAll('ul, ol')).map((list, listIndex) => {
        // Get list items
        const items = Array.from(list.querySelectorAll('li')).map(li => ({
            text: li.textContent.trim(),
            hasLinks: li.querySelectorAll('a').length > 0,
            hasButtons: li.querySelectorAll('button').length > 0,
            className: li.className
        }));
        
        // Try to determine list purpose from container or heading
        let listTitle = '';
        let listContext = '';
        
        // Check if there's a heading right before the list
        const previousElement = list.previousElementSibling;
        if (previousElement && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(previousElement.tagName)) {
            listTitle = previousElement.textContent.trim();
        }
        
        // Check if list is inside a container with an ID or class that hints at purpose
        let parent = list.parentElement;
        while (parent && parent !== document.body) {
            if (parent.id || parent.className) {
                const identifier = parent.id || parent.className;
                // Look for common words in the identifier
                const purposeKeywords = ['navigation', 'menu', 'sidebar', 'links', 'options', 'actions'];
                for (const keyword of purposeKeywords) {
                    if (identifier.toLowerCase().includes(keyword)) {
                        listContext = keyword.charAt(0).toUpperCase() + keyword.slice(1);
                        break;
                    }
                }
                if (listContext) break;
            }
            parent = parent.parentElement;
        }
        
        return {
            id: list.id || `list-${listIndex}`,
            type: list.tagName.toLowerCase(),
            className: list.className,
            itemCount: items.length,
            items: items.slice(0, 5), // Include first 5 items only
            hasMoreItems: items.length > 5,
            title: listTitle,
            context: listContext
        };
    });
    
    // Standard data collection
    return {
        userId: "67cf6a12d454ce786d5c246a",
        projectId: "67d35cfb7ee68519932882b6",
        url: window.location.href,
        title: document.title,
        meta: Array.from(document.getElementsByTagName("meta")).map(meta => ({
            name: meta.getAttribute("name"),
            content: meta.getAttribute("content")
        })),
        elements: Array.from(document.querySelectorAll("*")).map(el => el.tagName),
        textContent: document.body.innerText.slice(0, 5000),
        interactiveElements: Array.from(document.querySelectorAll("button, a, input, textarea, select, form")).map(el => ({
            tag: el.tagName,
            text: el.innerText || el.value || "",
            id: el.id || null,
            class: el.className || null
        })),
        // Add structured data elements
        tables: tablesData,
        lists: listsData
    };
}
    
    // Create a notification toast function
    function showNotification(message, isError = false) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '80px';
        toast.style.right = '20px';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '6px';
        toast.style.backgroundColor = isError ? '#ef4444' : '#10b981';
        toast.style.color = 'white';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.zIndex = '10000';
        toast.style.maxWidth = '300px';
        toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        toast.style.fontSize = '14px';
        toast.style.transition = 'all 0.3s ease';
        toast.style.opacity = '0';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 50);
        
        // Remove after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 5000);
    }
    
    // Send data to server
    try {
        const pageData = getPageData();
        pageData.filename = "script-1741905147816.js"; // Add script filename for tracking
        
        const response = await fetch("http://localhost:3000/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pageData),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Tracking data sent successfully:", result);
        
        // Get the page ID from the response
        const pageId = result.pageId ? result.pageId.toString() : '';
        const tourUrl = "http://localhost:3000/project/onboarding/" + pageData.projectId + "/" + pageId;
        
        // Create floating button
        const button = document.createElement('button');
        button.innerHTML = '?';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.width = '50px';
        button.style.height = '50px';
        button.style.borderRadius = '50%';
        button.style.backgroundColor = '#2563eb';
        button.style.color = 'white';
        button.style.fontSize = '20px';
        button.style.border = 'none';
        button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        button.style.cursor = 'pointer';
        button.style.zIndex = '9999';
        
        // Add hover effect
        button.onmouseover = function() {
            this.style.backgroundColor = '#1d4ed8';
        };
        button.onmouseout = function() {
            this.style.backgroundColor = '#2563eb';
        };
        
        // Add click event to load the tour
        button.onclick = function() {
            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = '⟳';
            this.style.animation = 'spin 1s linear infinite';
            
            // Add a spin animation
            if (!document.getElementById('spin-keyframes')) {
                const style = document.createElement('style');
                style.id = 'spin-keyframes';
                style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                document.head.appendChild(style);
            }
            
            // Instead of creating a script element, fetch the script and evaluate it
            fetch(tourUrl)
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 404) {
                            throw new Error('No onboarding tour found for this page');
                        }
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(scriptContent => {
                    if (!scriptContent || scriptContent.trim() === '') {
                        throw new Error('No onboarding tour available');
                    }
                    
                    // Reset button state
                    this.innerHTML = originalText;
                    this.style.animation = '';
                    
                    // Execute the tour script
                    const scriptFunc = new Function(scriptContent);
                    scriptFunc();
                })
                .catch(err => {
                    console.error("Error loading tour:", err);
                    
                    // Reset button state
                    this.innerHTML = originalText;
                    this.style.animation = '';
                    
                    // Show user-friendly error notification
                    if (err.message.includes('No onboarding') || err.message.includes('404')) {
                        showNotification('No onboarding tour has been created for this page yet. Please go to the dashboard to create one.', true);
                    } else {
                        showNotification('Failed to load the onboarding tour. Please try again later.', true);
                    }
                });
        };
        
        document.body.appendChild(button);
        
    } catch (error) {
        console.error("Error sending tracking data:", error);
        showNotification('Failed to connect to the onboarding service. Please try again later.', true);
    }
})();
