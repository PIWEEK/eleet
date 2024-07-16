import bpy
import os

#
# Obtenemos la ruta base donde está guardado el
# archivo .blend
#
basedir = os.path.dirname(bpy.data.filepath)

if not basedir:
    raise Exception("Blend file is not saved")

#
# Nombre del modelo a exportar.
# TODO: Esto se podría extraer del nombre del archivo .blend
#
name = "model.txt"

#
# Abrimos el archivo para escritura.
# TODO: Podriamos detectar si el archivo ya existe y si existe entonces
# podríamos añadirle una extension al final o la fecha.
#
f = open(os.path.join(basedir, name), "w")

#
# Iteramos por todas las mallas que haya
# dentro del archivo y exportamos sus coordenadas
# en un archivico de texto.
#
for mesh in bpy.data.meshes:
    f.write("# {}\n".format(mesh.name))
    for vertex in mesh.vertices:
        f.write("v {}: {}, {}, {}\n".format(vertex.index, vertex.co[0], vertex.co[1], vertex.co[2]))
    for triangle in mesh.loop_triangles:
        f.write("t {}: {}, {}, {}\n".format(triangle.index, triangle.vertices[0], triangle.vertices[1], triangle.vertices[2]))
    for edge in mesh.edges:
        f.write("e {}: {}, {}\n".format(edge.index, edge.vertices[0], edge.vertices[1]))

#
# Iteramos por todos los objetos que hay en la escena
# para encontrar aquellos que representan posiciones
# especiales dentro de la malla.
#
for obj in bpy.data.objects:
    if (obj.name.startswith("hp_")):
        f.write("# hard point {}\n".format(obj.name))
        f.write("{}: {} {} {}\n".format(obj.name, obj.location[0], obj.location[1], obj.location[2]))

#
# Cerramos el archivo
#
f.close()
