import { CatmullRomCurve3, MathUtils, Quaternion, Vector3 } from "three";

export type CameraPose = {
  position: Vector3;
  target: Vector3;
  up: Vector3;
  tangent: Vector3;
  bank: number;
  heading: number;
  pitch: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export class CameraPath {
  private readonly curve: CatmullRomCurve3;
  private readonly lookCurve: CatmullRomCurve3;
  private readonly normal = new Vector3(0, 1, 0);
  private readonly probeA = new Vector3();
  private readonly probeB = new Vector3();

  constructor() {
    this.curve = new CatmullRomCurve3(
      [
        new Vector3(-0.4, 0.12, 8),
        new Vector3(0.18, 0.32, -10),
        new Vector3(0.62, 0.54, -34),
        new Vector3(0.28, 0.16, -62),
        new Vector3(-0.24, -0.18, -98),
        new Vector3(-0.58, -0.06, -144),
        new Vector3(-0.22, 0.3, -198),
        new Vector3(0.26, 0.48, -262),
        new Vector3(0.52, 0.18, -334),
        new Vector3(0.08, -0.2, -418),
      ],
      false,
      "catmullrom",
      0.85
    );

    this.lookCurve = new CatmullRomCurve3(
      [
        new Vector3(-0.12, 0.08, -12),
        new Vector3(0.22, 0.24, -30),
        new Vector3(0.44, 0.42, -56),
        new Vector3(0.08, 0.1, -90),
        new Vector3(-0.36, -0.08, -132),
        new Vector3(-0.42, 0.06, -186),
        new Vector3(-0.1, 0.22, -248),
        new Vector3(0.3, 0.3, -318),
        new Vector3(0.36, 0.1, -392),
        new Vector3(0.06, -0.02, -472),
      ],
      false,
      "catmullrom",
      0.78
    );
  }

  getPose(progress: number): CameraPose {
    const t = clamp01(progress);
    const position = this.curve.getPointAt(t);
    const target = this.lookCurve.getPointAt(t);
    const tangent = this.curve.getTangentAt(t).normalize();

    const probeOffset = 0.012;
    this.probeA.copy(this.curve.getTangentAt(clamp01(t - probeOffset))).normalize();
    this.probeB.copy(this.curve.getTangentAt(clamp01(t + probeOffset))).normalize();

    const heading = Math.atan2(tangent.x, -tangent.z);
    const pitch = Math.asin(MathUtils.clamp(tangent.y, -1, 1));
    const signedTurn = this.probeA.clone().cross(this.probeB).y;
    const bank = MathUtils.clamp(-signedTurn * 6.5, -0.12, 0.12);

    const up = this.normal.clone().applyQuaternion(new Quaternion().setFromAxisAngle(tangent, bank)).normalize();

    return {
      position,
      target,
      up,
      tangent,
      bank,
      heading,
      pitch,
    };
  }
}

export function createCameraPath() {
  return new CameraPath();
}
