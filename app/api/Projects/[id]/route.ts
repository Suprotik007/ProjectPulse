import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectDB from "@/lib/db/mongoose";
import { Project, CheckIn, Feedback, Risk } from "@/lib/models";
import { requireRole } from "@/lib/utils/auth";

// GET /api/Projects/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ["Admin", "Employee", "Client"]);

    const { id: projectId } = await params;
    
    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    await connectDB();

    // Get project with populated references
    const project = await Project.findById(projectId)
      .populate("clientId", "name email")
      .populate("employeeIds", "name email");

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get recent check-ins (last 5)
    const recentCheckIns = await CheckIn.find({ projectId })
      .populate("employeeId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent feedback (last 5)
    const recentFeedback = await Feedback.find({ projectId })
      .populate("clientId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get all risks
    const risks = await Risk.find({ projectId })
      .populate("employeeId", "name")
      .sort({ createdAt: -1 });

    // Count statistics
    const totalCheckIns = await CheckIn.countDocuments({ projectId });
    const totalFeedback = await Feedback.countDocuments({ projectId });
    const openRisks = await Risk.countDocuments({
      projectId,
      status: "Open",
    });

    return NextResponse.json({
      success: true,
      project,
      recentCheckIns,
      recentFeedback,
      risks,
      stats: {
        totalCheckIns,
        totalFeedback,
        openRisks,
        totalRisks: risks.length,
      },
    });
  } catch (error: any) {
    console.error("Get project error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/// PUT /api/Projects/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ["Admin"]);

    // Await params in Next.js 15
    const { id: projectId } = await params;
    
    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, startDate, endDate, clientId, employeeIds, status } = body;

    // Validate dates before updating
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end && end <= start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    await connectDB();

    // Build update object only with provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (clientId !== undefined) updateData.clientId = clientId;
    if (employeeIds !== undefined) updateData.employeeIds = employeeIds;
    if (status !== undefined) updateData.status = status;

    const project = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { 
        new: true, 
        runValidators: false, // Disable mongoose validators since we validated manually
      }
    )
      .populate("clientId", "name email")
      .populate("employeeIds", "name email");

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("Update project error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// DELETE /api/Projects/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ["Admin"]);

    
    const { id: projectId } = await params;
    
    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Optional: Also delete related data
    await CheckIn.deleteMany({ projectId });
    await Feedback.deleteMany({ projectId });
    await Risk.deleteMany({ projectId });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete project error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

