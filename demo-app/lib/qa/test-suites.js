export const WIDGET_TEST_SUITE = {
    name: "Widgets Module Test",
    moduleId: "widgets",
    modules: ["widgets"], // Dependencies
    steps: [
        { say: "create panel for Sales", waitMs: 500 },
        { say: "create panel for Marketing", waitMs: 500 },
        { expect: (state) => state.widgets.length === 2, label: "Two widgets created" },
        { say: "rename widget Sales to Revenue", waitMs: 500 },
        { expect: (state) => state.widgets.find(w => w.name === 'Revenue'), label: "Rename successful" },
        { say: "remove widget Marketing", waitMs: 500 },
        { expect: (state) => state.widgets.length === 1, label: "Remove successful" }
    ]
};

export const LINKS_TEST_SUITE = {
    name: "Links & Data Binding Test",
    moduleId: "links",
    modules: ["widgets", "links"], // Needs widgets to link
    steps: [
        { say: "create panel for Source", waitMs: 200 },
        { say: "create panel for Target", waitMs: 200 },
        { say: "link Source to Target", waitMs: 500 },
        { expect: (state) => state.links.length === 1, label: "Link created" },
        { say: "filter Source by Urgent", waitMs: 500 },
        { expect: (state) => state.widgets.find(w => w.name === 'Target').data.filter === 'Urgent', label: "Filter propagated" }
    ]
};
