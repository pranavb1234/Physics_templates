import { pendulumMotion } from "../motions/pendulum_shm";
import { springMotion } from "../motions/spring_shm";

export const MotionRegistry = {
  pendulum_shm: pendulumMotion,
  spring_shm: springMotion
};
