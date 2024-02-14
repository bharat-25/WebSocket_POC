"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityConsumer = void 0;
class ActivityConsumer {
    async postActivity(key, value) {
        try {
            console.log("inside post activity:", key, value);
        }
        catch (error) {
            console.log('error in create schedule tracker data ============>>', error);
        }
    }
}
exports.activityConsumer = new ActivityConsumer();
