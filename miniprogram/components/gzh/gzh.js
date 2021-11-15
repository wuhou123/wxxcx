Component({
    properties: {
        gzhName: String,
        gzhEwmImg: String
    },
    data: {},
    methods: {
        componentCancel: function() {
            this.triggerEvent("cancel");
        }
    }
});