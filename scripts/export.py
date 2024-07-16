import bpy
import json
import sys

# Call the script with something like
# blender --background --python scripts/export.py -- models/basic-ship.blend
argv = sys.argv
argv = argv[argv.index("--") + 1:]  # get all args after "--"

if len(argv) < 1:
    raise Exception("Blend file not specified")

input_path = argv[0]
output_path = argv[0] + ".json"

bpy.ops.wm.open_mainfile(filepath=input_path)

# Iteramos por todas las mallas que haya
# dentro del archivo y exportamos sus coordenadas
# en un archivico de json.
meshes = []
for mesh in bpy.data.meshes:
    vertices = []
    for vertex in mesh.vertices:
        vertices.extend(list(vertex.co))

    triangles = []
    for triangle in mesh.loop_triangles:
        triangles.extend(list(triangle.vertices))

    edges = []
    for edge in mesh.edges:
        edges.extend(list(edge.vertices))

    meshes.append({
      "name": "# {}".format(mesh.name),
      "vertices": vertices,
      "triangles": triangles,
      "edges": edges
    })

# Iteramos por todos los objetos que hay en la escena
# para encontrar aquellos que representan posiciones
# especiales dentro de la malla.

objects = []
for obj in bpy.data.objects:
  print("---", obj.name, obj.name, list(obj.location))
  objects.append({
      "name": "# {}".format(obj.name),
      "is_hard_point": obj.name.startswith("hp_"),
      "location": list(obj.location)
    })

# Data to be written
dictionary = {
    "meshes": meshes,
    "objects": objects
}

# Serializing json
json_object = json.dumps(dictionary, indent=4)

# TODO: Podriamos detectar si el archivo ya existe y si existe entonces
# podríamos añadirle una extension al final o la fecha.

# Writing output
with open(output_path, "w") as outfile:
    outfile.write(json_object)
