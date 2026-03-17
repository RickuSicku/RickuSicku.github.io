document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('github-projects-container');
    const loadingElement = document.getElementById('github-loading');
    const username = 'RickuSicku';

    // CONFIGURATION: Map GitHub repo names to custom display titles here
    // Example: "repo-name": "My Custom Title"
    const projectNames = {
        "RickuSicku.github.io": "Personal Portfolio Website",
        "Physics-Informed-Machine-Learning-Robustness-and-Interpretability": "PINN : Interpretability & Simulations",
        "Ethereum-Phishing-Scam-Detection": "Ethereum Scam Detection",
        "msai349-violence-detection": "Real Time CCTV - Violence Detection"
        // Add more here: "exact-repo-name": "New Name"
    };

    async function fetchProjects() {
        try {
            // Fetch User's Repos Only (private repos are hardcoded in Featured Projects section)
            const userResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);

            if (!userResponse.ok) throw new Error('GitHub API request failed for user repos');

            let userData = await userResponse.json();

            // Filter out forks (display only original work)
            let projects = userData.filter(p => !p.fork);

            // Sort by updated time
            projects.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

            // Fetch languages for each project
            projects = await Promise.all(projects.map(async (project) => {
                try {
                    const langResponse = await fetch(project.languages_url);
                    if (langResponse.ok) {
                        const langs = await langResponse.json();
                        // Get top 5 languages to avoid overcrowding
                        project.techStack = Object.keys(langs).slice(0, 5);
                    } else {
                        project.techStack = project.language ? [project.language] : [];
                    }
                } catch (e) {
                    project.techStack = project.language ? [project.language] : [];
                }
                return project;
            }));

            renderProjects(projects);
        } catch (error) {
            console.error('Error fetching GitHub projects:', error);
            container.innerHTML = `<div class="col-span-full text-center text-red-500">Failed to load projects from GitHub.</div>`;
        } finally {
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }

    function formatProjectName(name) {
        if (projectNames[name]) {
            return projectNames[name];
        }
        return name.replace(/[-_]/g, ' ');
    }

    function renderProjects(projects) {
        if (projects.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center text-gray-500">No public repositories found.</div>';
            return;
        }

        const html = projects.map(project => {
            const description = project.description || 'No description available.';
            const stars = project.stargazers_count > 0 ? `
                <span class="flex items-center text-xs text-yellow-600">
                    <svg class="w-4 h-4 mr-1 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                    ${project.stargazers_count}
                </span>
            ` : '';

            const date = new Date(project.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const displayName = formatProjectName(project.name);

            // Tech Stack Bubbles
            const techStackHtml = project.techStack && project.techStack.length > 0
                ? `<div class="flex flex-wrap gap-2 mb-4">
                    ${project.techStack.map(tech =>
                    `<span class="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium border border-blue-100">${tech}</span>`
                ).join('')}
                   </div>`
                : '';

            return `
                <a href="${project.html_url}" target="_blank" class="block group">
                    <div class="h-full bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors break-words">
                                ${displayName}
                            </h3>
                        </div>
                        
                        <p class="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                            ${description}
                        </p>

                        ${techStackHtml}
                        
                        <div class="flex items-center justify-between mt-auto text-sm text-gray-500 border-t pt-4">
                            <span class="flex items-center">
                                ${stars}
                                ${stars ? '<span class="mx-2">•</span>' : ''}
                                Updated ${date}
                            </span>
                            <svg class="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                            </svg>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

        container.innerHTML = html;
    }

    fetchProjects();
});
