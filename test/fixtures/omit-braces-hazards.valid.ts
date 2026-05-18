interface Material { uniforms: { time: { value: number }}}
declare function isAnimatedShader (m: Material): boolean

type MeshType = { material: Material | Material[] | null | undefined }


// Dangling-else hazard: the outer braces are load-bearing — without
// them, the trailing `else` would re-bind to `if (isAnimatedShader(m))`,
// silently changing semantics. The omit rule must NOT flag these braces.
export function update (mesh: MeshType, t: number) {
  if (Array.isArray(mesh.material)) {
    for (const m of mesh.material)
      if (isAnimatedShader(m))
        m.uniforms.time.value = t
  }
  else if (isAnimatedShader(mesh.material!))
    mesh.material!.uniforms.time.value = t
}
