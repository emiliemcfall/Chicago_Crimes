import os
import random
from scipy import ndarray

# image processing library
import skimage as sk
from skimage import transform
from skimage import util
from skimage import io
from skimage.transform import rotate


def random_rotation(image_array: ndarray):
    #random_degree = random.uniform(-X, X)
    #return sk.transform.rotate(image_array, angle=90,center=None)
    return sk.transform.rotate(image_array, 45, mode="reflect")

def random_noise(image_array: ndarray):
    # add random noise to the image
    return sk.util.random_noise(image_array)

def horizontal_flip(image_array: ndarray):
    # horizontal flip doesn't need skimage, it's easy as flipping the image array of pixels !
    return image_array[:, ::-1]

# def main():
# dictionary of the transformations we defined earlier
available_transformations = {
    'rotate': random_rotation,
    #'noise': random_noise,
    'horizontal_flip': horizontal_flip
}

folder_path = 'data/training/images'
groundtruth_folder_path = 'data/training/groundtruth'
num_files_desired = 100
num_training_images = 100

# find all files paths from the folder
images = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]

num_generated_files = 0

while num_generated_files <= num_files_desired:

    # random image from the folders
    image_path = random.choice(images)
    #print(image_path[21:37])
    # read images as an two dimensional array of pixels
    image_to_transform = sk.io.imread(image_path)
    image_gt_to_transform = sk.io.imread(groundtruth_folder_path + '/' + image_path[21:37])

    # random num of transformation to apply
    num_transformations_to_apply = random.randint(1, len(available_transformations))

    num_transformations = 0
    transformed_image = None
    while num_transformations <= num_transformations_to_apply:
        # random transformation to apply for a single image
        key = random.choice(list(available_transformations))
        transformed_image = available_transformations[key](image_to_transform)
        # if key == 'noise':
        #     transformed_image_gt = image_gt_to_transform
        # else:
        #     transformed_image_gt = available_transformations[key](image_gt_to_transform)
        transformed_image_gt = available_transformations[key](image_gt_to_transform)
        num_transformations += 1
        #print(num_transformations)

        new_file_path = '%s/satImage_%s.png' % (folder_path, num_generated_files + num_training_images + 1)
        new_file_path_gt = '%s/satImage_%s.png' % (groundtruth_folder_path, num_generated_files + num_training_images + 1)


        # write images to the disk
        io.imsave(new_file_path, transformed_image)
        io.imsave(new_file_path_gt, transformed_image_gt)
        num_generated_files += 1
        # print(new_file_path)
