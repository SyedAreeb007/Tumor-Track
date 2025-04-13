import sys
import os
import numpy as np
import nibabel as nib
import cv2
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.models import load_model
import nilearn as nl
import nilearn.plotting as nlplt

IMG_SIZE = 128
VOLUME_SLICES = 100
VOLUME_START_AT = 22
SEGMENT_CLASSES = {
    0: "NOT tumor",
    1: "NECROTIC/CORE",
    2: "EDEMA",
    3: "ENHANCING"
}
CLASS_NAMES = ["No Tumor", "Glioma", "Meningioma"]

try:
    segmentation_model = load_model("D:/Tumor-Track/backend/models/model_per_class.h5", compile=False)
    classification_model = load_model("D:/Tumor-Track/backend/models/tumor_classification_model.h5", compile=False)
except Exception as e:
    print(f"Error loading models: {e}", file=sys.stderr)
    sys.exit(1)

def detect_lobe(mask):
    """Estimate tumor lobe based on segmentation mask's center of mass."""
    # Get indices where mask is non-zero (tumor regions: core, edema, enhancing)
    tumor_indices = np.where(mask > 0)
    if len(tumor_indices[0]) == 0:
        return "Unknown"
    
    # Compute center of mass (average coordinates)
    center_z, center_y, center_x = np.mean(tumor_indices, axis=1)
    
    # Normalize to volume dimensions (assuming standard brain orientation)
    z_norm = center_z / mask.shape[2]  # Anterior-posterior
    y_norm = center_y / mask.shape[1]  # Superior-inferior
    x_norm = center_x / mask.shape[0]  # Left-right
    
    # Simplified lobe mapping (based on brain anatomy)
    if z_norm < 0.4:  # Anterior
        return "Frontal"
    elif z_norm > 0.6:  # Posterior
        if y_norm > 0.5:  # Superior
            return "Parietal"
        else:  # Inferior
            return "Occipital"
    else:  # Middle
        if y_norm < 0.5:  # Inferior
            return "Temporal"
        else:
            return "Parietal"

def infer_grade(tumor_type, enhancing_percentage):
    """Infer tumor grade based on tumor type and enhancing percentage."""
    if tumor_type == "No Tumor":
        return "None"
    # Heuristics: Higher enhancing percentage suggests higher grade
    if enhancing_percentage > 5.0:
        return "High"
    elif enhancing_percentage > 1.0:
        if tumor_type == "Glioma":
            return "Medium"
        else:  # Meningioma
            return "Low"
    else:
        return "Low"

def predict_by_path(flair_path, t1ce_path, output_dir="Uploads"):
    try:
        X = np.empty((VOLUME_SLICES, IMG_SIZE, IMG_SIZE, 2))
        
        # Load input files
        flair = nib.load(flair_path).get_fdata()
        t1ce = nib.load(t1ce_path).get_fdata()
        
        # Mock T1 and T2
        t1 = flair * 0.8
        t2 = t1ce * 1.2
        
        # Preprocess for segmentation
        for j in range(VOLUME_SLICES):
            X[j, :, :, 0] = cv2.resize(flair[:, :, j + VOLUME_START_AT], (IMG_SIZE, IMG_SIZE))
            X[j, :, :, 1] = cv2.resize(t1ce[:, :, j + VOLUME_START_AT], (IMG_SIZE, IMG_SIZE))
        
        # Classification: Predict tumor type
        slice_idx = VOLUME_SLICES // 2
        flair_slice = cv2.resize(flair[:, :, slice_idx + VOLUME_START_AT], (IMG_SIZE, IMG_SIZE))
        flair_slice = (flair_slice - np.min(flair_slice)) / (np.max(flair_slice) - np.min(flair_slice) + 1e-10)
        flair_slice = np.expand_dims(flair_slice, axis=[0, -1])
        class_pred = classification_model.predict(flair_slice, verbose=0)
        tumor_type = CLASS_NAMES[np.argmax(class_pred)]
        
        # Segmentation
        predictions = segmentation_model.predict(X / np.max(X), verbose=0)
        
        # Extract masks
        threshold = 0.5
        not_tumor = predictions[..., 0] > threshold
        core = predictions[..., 1] > threshold
        edema = predictions[..., 2] > threshold
        enhancing = predictions[..., 3] > threshold
        
        # Calculate percentages
        not_tumor_percentage = np.mean(not_tumor) * 100
        core_percentage = np.mean(core) * 100
        edema_percentage = np.mean(edema) * 100
        enhancing_percentage = np.mean(enhancing) * 100
        
        # Detect lobe and grade
        predicted_mask = np.argmax(predictions, axis=-1)
        lobe = detect_lobe(predicted_mask)
        grade = infer_grade(tumor_type, enhancing_percentage)
        
        # Save images
        flair_slice_img = cv2.resize(flair[:, :, slice_idx + VOLUME_START_AT], (IMG_SIZE, IMG_SIZE))
        t1_slice = cv2.resize(t1[:, :, slice_idx + VOLUME_START_AT], (IMG_SIZE, IMG_SIZE))
        t1ce_slice = cv2.resize(t1ce[:, :, slice_idx + VOLUME_START_AT], (IMG_SIZE, IMG_SIZE))
        t2_slice = cv2.resize(t2[:, :, slice_idx + VOLUME_START_AT], (IMG_SIZE, IMG_SIZE))
        mask_slice = cv2.resize(predicted_mask[slice_idx].astype(np.uint8), (IMG_SIZE, IMG_SIZE))
        
        image_paths = {}
        plt.figure()
        plt.imshow(flair_slice_img, cmap="gray")
        plt.axis("off")
        flair_path_out = os.path.join(output_dir, "flair_slice.png")
        plt.savefig(flair_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["flair"] = flair_path_out
        
        plt.figure()
        plt.imshow(t1_slice, cmap="gray")
        plt.axis("off")
        t1_path_out = os.path.join(output_dir, "t1_slice.png")
        plt.savefig(t1_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["t1"] = t1_path_out
        
        plt.figure()
        plt.imshow(t1ce_slice, cmap="gray")
        plt.axis("off")
        t1ce_path_out = os.path.join(output_dir, "t1ce_slice.png")
        plt.savefig(t1ce_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["t1ce"] = t1ce_path_out
        
        plt.figure()
        plt.imshow(t2_slice, cmap="gray")
        plt.axis("off")
        t2_path_out = os.path.join(output_dir, "t2_slice.png")
        plt.savefig(t2_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["t2"] = t2_path_out
        
        plt.figure()
        plt.imshow(mask_slice, cmap="jet")
        plt.axis("off")
        mask_path_out = os.path.join(output_dir, "mask_slice.png")
        plt.savefig(mask_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["mask"] = mask_path_out
        
        niimg = nib.Nifti1Image(flair, np.eye(4))
        nimask = nib.Nifti1Image(predicted_mask.astype(np.uint8), np.eye(4))
        
        plt.figure(figsize=(10, 10))
        nlplt.plot_roi(nimask, bg_img=niimg, title="FLAIR with Mask ROI", cmap="Paired")
        roi_path_out = os.path.join(output_dir, "flair_roi.png")
        plt.savefig(roi_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["flair_roi"] = roi_path_out
        
        plt.figure(figsize=(10, 10))
        nlplt.plot_img(niimg, title="FLAIR Plot Img")
        img_path_out = os.path.join(output_dir, "flair_img.png")
        plt.savefig(img_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["flair_img"] = img_path_out
        
        plt.figure(figsize=(10, 10))
        nlplt.plot_anat(niimg, title="FLAIR Plot Anat")
        anat_path_out = os.path.join(output_dir, "flair_anat.png")
        plt.savefig(anat_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["flair_anat"] = anat_path_out
        
        not_tumor_slice = not_tumor[slice_idx].astype(np.uint8) * 255
        plt.figure()
        plt.imshow(flair_slice_img, cmap="gray")
        plt.imshow(not_tumor_slice, cmap="Greys", alpha=0.5)
        plt.axis("off")
        not_tumor_path_out = os.path.join(output_dir, "not_tumor_slice.png")
        plt.savefig(not_tumor_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["not_tumor"] = not_tumor_path_out
        
        core_slice = core[slice_idx].astype(np.uint8) * 255
        plt.figure()
        plt.imshow(flair_slice_img, cmap="gray")
        plt.imshow(core_slice, cmap="Blues", alpha=0.5)
        plt.axis("off")
        core_path_out = os.path.join(output_dir, "core_slice.png")
        plt.savefig(core_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["core"] = core_path_out
        
        edema_slice = edema[slice_idx].astype(np.uint8) * 255
        plt.figure()
        plt.imshow(flair_slice_img, cmap="gray")
        plt.imshow(edema_slice, cmap="Greens", alpha=0.5)
        plt.axis("off")
        edema_path_out = os.path.join(output_dir, "edema_slice.png")
        plt.savefig(edema_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["edema"] = edema_path_out
        
        enhancing_slice = enhancing[slice_idx].astype(np.uint8) * 255
        plt.figure()
        plt.imshow(flair_slice_img, cmap="gray")
        plt.imshow(enhancing_slice, cmap="Reds", alpha=0.5)
        plt.axis("off")
        enhancing_path_out = os.path.join(output_dir, "enhancing_slice.png")
        plt.savefig(enhancing_path_out, bbox_inches="tight", pad_inches=0)
        plt.close()
        image_paths["enhancing"] = enhancing_path_out
        
        # Compile result
        result = (
            f"Not tumor: {not_tumor_percentage:.2f}%, "
            f"Necrotic/Core: {core_percentage:.2f}%, "
            f"Edema: {edema_percentage:.2f}%, "
            f"Enhancing: {enhancing_percentage:.2f}%"
        )
        
        # Return tumor type, lobe, grade, result, and image paths
        paths_str = "|".join(image_paths.values())
        return f"{tumor_type}|{lobe}|{grade}|{result}|{paths_str}"
    
    except Exception as e:
        print(f"Error in predict_by_path: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python predict.py <flair_path> <t1ce_path>", file=sys.stderr)
        sys.exit(1)
    flair_path = sys.argv[1]
    t1ce_path = sys.argv[2]
    result = predict_by_path(flair_path, t1ce_path)
    print(result)