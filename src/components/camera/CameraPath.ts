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
        new Vector3(-1.08, -0.12, 42),
        new Vector3(-0.76, -0.08, -68),
        new Vector3(-0.22, -0.12, -242),
        new Vector3(0.22, -0.22, -472),
        new Vector3(0.18, -0.38, -682),
        new Vector3(0.08, -0.68, -804),
        new Vector3(0.05, -0.92, -848),
        new Vector3(0.03, -1.08, -872),
      ],
      false,
      "catmullrom",
      0.84
    );

    this.lookCurve = new CatmullRomCurve3(
      [
        new Vector3(-0.16, -0.42, -80),
        new Vector3(-0.06, -0.5, -248),
        new Vector3(0.04, -0.7, -506),
        new Vector3(0.06, -1.0, -742),
        new Vector3(0.04, -1.18, -836),
        new Vector3(0.04, -1.16, -820),
      ],
      false,
      "catmullrom",
      0.76
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
