import { doubleSpringMotion } from "../motions/double_spring_shm";
import { particleMotion } from "../motions/particle_shm";
import { pendulumMotion } from "../motions/pendulum_shm";
import { springMotion } from "../motions/spring_shm";

export const MotionRegistry = {
  pendulum_shm: pendulumMotion,
  spring_shm: springMotion,
  particle_shm: particleMotion,
  double_spring_shm: doubleSpringMotion
};
