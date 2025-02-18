const app = Vue.createApp({
    data() {
        return {
            searchQuery: "",
            totalRecords: 0,
            selectedStatuses: [],
            uniqueStatuses: ["playable", "ingame", "menus", "boots", "nothing"],
            statusCounts: {},
        };
    },

    computed: {
        orderedStatuses() {
            return this.uniqueStatuses;
        },
    },

    methods: {
        clearSearch() {
            this.searchQuery = "";
        },
    },
});

app.component("ag-grid-vue", {
    template: '<div class="h-full" />',
    data() {
        return {
            gridApi: null,
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: false,
                suppressAutoSize: false,
                suppressSizeToFit: false,
                suppressMovable: true,
            },
            columnDefs: [
                {
                    headerName: "URL", //
                    field: "url",
                    cellRenderer: function (params) {
                        return `<a href="${params.value}" class="text-blue-500" target="_blank">Github</a>`;
                    },
                    minWidth: 150,
                },
                {
                    headerName: "Game Name", //
                    field: "body.game_name",
                    minWidth: 200,
                },
                {
                    headerName: "Game Code", //
                    field: "body.game_code",
                    minWidth: 200,
                },
                {
                    headerName: "Current Status", //
                    field: "body.current_status",
                    minWidth: 150,
                },
                {
                    headerName: "Submitter", //
                    field: "submitter",
                    minWidth: 200,
                },
                {
                    headerName: "Labels", //
                    field: "labels",
                    cellRenderer: function (params) {
                        const labels = params.data.labels.map(
                            (label) =>
                                `<div class="px-2 py-1 text-xs font-semibold text-white bg-gray-300 rounded-sm" style="background-color: #${label.color}">${label.name}</div>`
                        );

                        return `<div class="flex flex-col items-start justify-center space-y-1 h-full">${labels.join(
                            ""
                        )}</div>`;
                    },
                    minWidth: 100,
                },
                {
                    headerName: "Screenshots", //
                    field: "screenshots",
                    cellRenderer: function (params) {
                        const images = params.data.body.screenshots.map(
                            (url) =>
                                `<a href="${url}" data-lightbox="lightbox-${params.data.body.game_code}">
                                    <img src="${url}" class="h-16 object-cover border border-gray-100 rounded-sm">
                                </a>`
                        );

                        return `<div class="flex flex-row my-1 space-x-1">${images.join(
                            ""
                        )}</div>`;
                    },
                    minWidth: 200,
                },
                {
                    headerName: "Updated At", //
                    field: "updated_at",
                    minWidth: 200,
                },
            ],
            rowData: [],
        };
    },

    computed: {
        filteredData() {
            const searchQuery = this.$root.searchQuery.toLowerCase();
            const selectedStatuses = this.$root.selectedStatuses;

            const filteredRowData = this.rowData.filter((row) => {
                const matchesTitle =
                    row.title && row.title.toLowerCase().includes(searchQuery);

                const matchesStatus = (row) => {
                    if (selectedStatuses.length === 0) return true;

                    return (
                        selectedStatuses.includes(
                            row.body.current_status.toLowerCase()
                        ) ||
                        (row.labels &&
                            row.labels.some((label) =>
                                selectedStatuses.some(
                                    (status) => label.name === status
                                )
                            ))
                    );
                };

                // console.log(matchesStatus(row))

                return matchesTitle && matchesStatus(row);
            });

            this.$root.totalRecords = filteredRowData.length;

            return filteredRowData;
        },
    },

    watch: {
        filteredData(newVal) {
            this.gridApi.updateGridOptions({ rowData: newVal });
        },
    },

    mounted() {
        const gridOptions = {
            columnDefs: this.columnDefs,
            rowData: this.rowData,
            onGridReady: this.onGridReady,
            defaultColDef: this.defaultColDef,
            alwaysShowHorizontalScroll: true,
            // autoSizeStrategy: {
            //     type: "fitGridWidth",
            //     // defaultMinWidth: 300,
            //     // columnLimits: [
            //     //     {
            //     //         colId: 'country',
            //     //         minWidth: 900
            //     //     }
            //     // ]
            // },
            rowHeight: 75,
        };

        this.gridApi = agGrid.createGrid(this.$el, gridOptions);
        this.columnApi = this.gridApi.columnApi;

        // this.gridApi.sizeColumnsToFit();
        // this.gridApi.autoSizeAllColumns();
    },

    methods: {
        async onGridReady(params) {
            try {
                const response = await fetch("/shadps4/shadps4-issues.json");

                const data = await response.json();

                this.rowData = data;

                this.$root.totalRecords = data.length;

                this.$root.statusCounts = data.reduce((acc, row) => {
                    let status = row.body.current_status.toLowerCase();
                    let uniqueStatuses = new Set();

                    if (!acc[status]) {
                        acc[status] = 0;
                    }
                    uniqueStatuses.add(status);

                    if (row.labels && row.labels.length > 0) {
                        row.labels.forEach((label) => {
                            uniqueStatuses.add(label.name);
                        });
                    }

                    uniqueStatuses.forEach((uniqueStatus) => {
                        if (!acc[uniqueStatus]) {
                            acc[uniqueStatus] = 0;
                        }
                        acc[uniqueStatus]++;
                    });

                    return acc;
                }, {});

                this.gridApi.updateGridOptions({ rowData: this.rowData });

                this.gridApi.sizeColumnsToFit();
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
    },
});

app.mount("#app");
