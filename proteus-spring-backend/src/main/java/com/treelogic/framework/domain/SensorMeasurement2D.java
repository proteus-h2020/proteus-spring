package com.treelogic.framework.domain;
public class SensorMeasurement2D extends SensorMeasurement {

	private double y;

	public SensorMeasurement2D() {

	}

	public SensorMeasurement2D(int coilId, double x, double y, int variableIdentifier, double value) {
		super();
		this.coilId = coilId;
		this.x = x;
		this.y = y;
		this.varId = variableIdentifier;
		this.value = value;
	}
	
	public double getY() {
		return y;
	}

	public void setY(double y) {
		this.y = y;
	}

	@Override
	public String toString() {
		return super.toString() + " ----- Row2D [y=" + y + "]";
	}

	public double getX() {
		return x;
	}

	public void setX(double x) {
		this.x = x;
	}


	@Override
	public int hashCode() {
		final int prime = 31;
		int result = super.hashCode();
		long temp;
		temp = Double.doubleToLongBits(x);
		result = prime * result + (int) (temp ^ (temp >>> 32));
		temp = Double.doubleToLongBits(y);
		result = prime * result + (int) (temp ^ (temp >>> 32));
		return result;
	}


	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (!super.equals(obj)) {
			return false;
		}
		if (!(obj instanceof SensorMeasurement2D)) {
			return false;
		}
		SensorMeasurement2D other = (SensorMeasurement2D) obj;
		if (Double.doubleToLongBits(x) != Double.doubleToLongBits(other.x)) {
			return false;
		}
		if (Double.doubleToLongBits(y) != Double.doubleToLongBits(other.y)) {
			return false;
		}
		return true;
	}

}