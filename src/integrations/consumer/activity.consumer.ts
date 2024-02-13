

class ActivityConsumer {
    async postActivity(key: string, value: any) {
        try {
            console.log("inside post activity:", key , value);
        } catch (error) {
            console.log('error in create schedule tracker data ============>>', error);
        }
    }
}

export const activityConsumer = new ActivityConsumer();
