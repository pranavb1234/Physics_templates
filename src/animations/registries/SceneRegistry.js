import DoubleSpringMassScene from "../scenes/DoubleSpringMassScene";
import PendulumScene from "../scenes/PendulumScene";
import ParticleShmScene from "../scenes/ParticleShmScene";
import SpringMassScene from "../scenes/SpringMassScene";

export const SceneRegistry = {
  pendulum: PendulumScene,
  spring_mass: SpringMassScene,
  particle_shm: ParticleShmScene,
  double_spring_mass: DoubleSpringMassScene
};
