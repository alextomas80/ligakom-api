const { Schema, model } = require("mongoose");

const UploadSchema = Schema(
    {
        title: {
            type: String,
        },
        filename: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        originalname: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

UploadSchema.set("toJSON", {
    transform: (document, returnedDocument) => {
        returnedDocument.id = returnedDocument._id;
        delete returnedDocument._id;
        delete returnedDocument.__v;
        delete returnedDocument.createdAt;
        delete returnedDocument.updatedAt;
        delete returnedDocument.originalname;
        delete returnedDocument.filename;
    },
});

module.exports = model("Upload", UploadSchema);
