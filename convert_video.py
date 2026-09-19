import cv2
import os

input_path = 'assets/images/IMG_3831.MOV.mp4'
output_path = 'assets/images/welcome-video.mp4'

cap = cv2.VideoCapture(input_path)
if not cap.isOpened():
    print("Error: Could not open video.")
    exit(1)

fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

print(f"Converting {input_path} ({width}x{height} @ {fps}fps, {total_frames} frames)...")

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    out.write(frame)
    count += 1
    if count % 60 == 0:
        print(f"Processed {count}/{total_frames} frames")

cap.release()
out.release()
print(f"Conversion complete! Saved to {output_path}")
